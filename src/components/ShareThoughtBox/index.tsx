import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"

import CreateCircleItem from "../CreateCircleItem"
import ShareCircleItem from "../ShareCircleItem"
import Send from "../SVGIcons/Send"
import XIcon from "../SVGIcons/XIcon"
import Chevron from '../SVGIcons/Chevron'
import CircleIcon from "../SVGIcons/CircleIcon"
import { useCircleContext } from "../../context/CircleContext"
import { BJActions } from "../../background/actions"
import classNames from "classnames"
import { CircleGenerationStatus } from "../../utils/constants"

const ShareThoughtBox = () => {

  const [comment, setComment] = useState<string>('')
  const [showCircles, setShowCircles] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { circles, currentTabId, currentTabTitle, currentUrl, circleData, getCircles, circleGenerationStatus, commentData, setCommentData, getCircleGenerationStatus, setIsOneClickCommenting, setOneClickStatusMessage } = useCircleContext()

  const commentBoxTitle = useMemo(() => {
    if (showCircles) {
      return "Choose a circle to share"
    } else {
      return "Send"
    }
  }, [showCircles])


  const handleCommentChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('')
    setComment(e.target.value)
  }, [])

  const handleDropDownClick = useCallback(() => {
    setErrorMessage('')
    setShowCircles(!showCircles)
  }, [showCircles])

  const handleSendIconClick = useCallback(() => {
    if (comment.length > 0) {
      setIsOneClickCommenting(true);

      chrome.runtime.sendMessage(
        {
          action: BJActions.SAVE_COMMENT_TO_STORAGE,
          comment: comment
        }
      )

      chrome.runtime.sendMessage(
        { action: BJActions.GET_COMMENT_FROM_STORAGE }, (res) => {
          if (res) {
            setCommentData(res);
          }
        }               
      )

      const name = currentTabTitle + " comments";
      
      setOneClickStatusMessage('Checking if circle exists ...')
      
      chrome.runtime.sendMessage(
        {
          action: BJActions.CHECK_IF_CIRCLE_EXIST,
          name
        },
        async (res) => {
          if (res) {
            const circleId = res;
            
            setOneClickStatusMessage('Posting comment in existed circle ...')
            
            chrome.runtime.sendMessage(
              {
                action: BJActions.CREATE_POST,
                context: comment,
                circleId
              }
            )

            setOneClickStatusMessage('Post was created in existed circle!')

            chrome.runtime.sendMessage({
              action: BJActions.REMOVE_COMMENT_FROM_STORAGE,
            });
            setCommentData('');

            setComment('')

            setIsOneClickCommenting(false)
          }
          else {
            setOneClickStatusMessage('Creating Circle...')

            chrome.runtime.sendMessage({
              action: BJActions.GENERATE_DIRECT_CIRCLE,
              tabId: currentTabId,
              name,
              description: comment,
              tags: circleData?.tags,
              url: currentUrl,
              circleName: name,
              circleDescription: comment,
              isGenesisPost: true,
              type: 'direct'
            },
            (res) => {
              if (res.error) {
                setOneClickStatusMessage('');
                setErrorMessage(res.error)
              }
              if (res.success) {
                getCircleGenerationStatus();
              }
            })
          }
        }
      )
    } else {
      setErrorMessage('Please put your thought.')
    }
  }, [circleData?.tags, comment, currentTabId, currentTabTitle, currentUrl, getCircleGenerationStatus, setCommentData, setIsOneClickCommenting, setOneClickStatusMessage])

  useEffect(() => {
    if (circleGenerationStatus?.type === 'direct') {
      console.log('sssssssssss abc')
      setComment(commentData)
      setOneClickStatusMessage('Creating Circle...')
    }
    if (circleGenerationStatus?.type === 'direct' && circleGenerationStatus?.status === CircleGenerationStatus.SUCCEEDED) {
      getCircles();
      chrome.runtime.sendMessage({
        action: BJActions.REMOVE_CIRCLES_FROM_STORAGE,
        tabId: currentTabId
      });
      chrome.runtime.sendMessage({
        action: BJActions.REMOVE_COMMENT_FROM_STORAGE,
      });
      setCommentData('');
      
      setComment("");
      
      setOneClickStatusMessage('Done!');
      
      getCircles();
      // setTimeout(() => {
      //   setIsStatusMessage(false);
      // }, 3000);
      
      setIsOneClickCommenting(false);
    }
  }, [circleGenerationStatus?.status, circleGenerationStatus?.type, commentData, currentTabId, getCircles, setCommentData, setIsOneClickCommenting, setOneClickStatusMessage])

  return (
    <div className="w-full rounded-2.5xl bg-branding pb-2">
      <div className="pt-1 px-1">
        <input
          type="text"
          placeholder="Any thoughts?"
          value={comment}
          onChange={handleCommentChange}
          className="p-4 w-full rounded-2xl text-primary placeholder-tertiary text-base font-normal leading-normal"
        />
      </div>
      {errorMessage && <p className="text-alert text-xs leading-5 font-medium px-3">{errorMessage}</p>}
      {/* {isStatusMessage && <p className="text-brand text-xs leading-5 font-medium px-3">{statusMessage}</p>} */}
      <div className="w-full flex flex-col gap-y-4">
        <div className="w-full px-2 pt-2 flex justify-between items-center">
          <div className={classNames("flex flex-row gap-2 px-3 items-center py-2 hover:bg-brand/10 hover:rounded-2xl transition-all duration-300", {
            'bg-transparent hover:bg-transparent': showCircles,
            'cursor-pointer': !showCircles
          })} onClick={showCircles ? undefined : handleSendIconClick}>
            <p className="text-base leading-5 font-semibold text-brand">{commentBoxTitle}</p>
            {!showCircles && <div className="text-brand"><Send className='w-5 h-5' /></div>}
          </div>
          <div className="flex px-3 py-2 rounded-2xl items-center justify-center gap-2 bg-brand/10" onClick={handleDropDownClick}>
            <div className="cursor-pointer text-brand">
                <CircleIcon width="20" height="20" viewBox="0 0 20 20" color="#134D2E" />
            </div>
            {
              showCircles ? 
                <div className="cursor-pointer text-brand"><XIcon /></div>
                :
                <div className="cursor-pointer text-brand"><Chevron width="16" height="16" color="#134D2E" viewBox="0 0 16 16" /></div>
            }
            
          </div>
        </div>
        {showCircles && <div className="px-2">
          <CreateCircleItem />
          <div className="w-full grid grid-cols-2 gap-2 pt-2">
            {circles.map((circle) => <ShareCircleItem circle={circle} key={circle.id} comment={comment} setComment={setComment} setShowCircles={setShowCircles} setErrorMessage={setErrorMessage} />)}
          </div>
        </div>}
      </div>
    </div>
  )
}

export default ShareThoughtBox
