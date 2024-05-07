import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"

import CreateCircleItem from "../CreateCircleItem"
import ShareCircleItem from "../ShareCircleItem"
import Send from "../SVGIcons/Send"
import XIcon from "../SVGIcons/XIcon"
import Chevron from '../SVGIcons/Chevron'
import CircleIcon from "../SVGIcons/CircleIcon"
import { useCircleContext } from "../../context/CircleContext"
import LoadingSpinner from "../LoadingSpinner"
import { BJActions } from "../../background/actions"
import classNames from "classnames"
import { CircleGenerationStatus } from "../../utils/constants"

const ShareThoughtBox = () => {

  const [comment, setComment] = useState<string>('')
  const [showCircles, setShowCircles] = useState<boolean>(false)
  const [isDirectPost, setIsDirectPost] = useState<boolean>(false)
  const [isStatusMessage, setIsStatusMessage] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { circles, currentTabId, currentTabTitle, currentUrl, circleData, getCircles, circleGenerationStatus, commentData, setCommentData, getCircleGenerationStatus } = useCircleContext()

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
      chrome.runtime.sendMessage(
        {
          action: BJActions.SAVE_COMMENT_TO_STORAGE,
          comment: comment
        }
      )
      const name = currentTabTitle + " comments";
      setIsDirectPost(true)
      setIsStatusMessage(true)
      setStatusMessage('Checking if circle exists ...')
      chrome.runtime.sendMessage(
        {
          action: BJActions.CHECK_IF_CIRCLE_EXIST,
          name
        },
        async (res) => {
          if (res) {
            const circleId = res;
            setStatusMessage('Posting comment in existed circle ...')
            chrome.runtime.sendMessage(
              {
                action: BJActions.CREATE_POST,
                context: comment,
                circleId
              }
            )
            setStatusMessage('Post was created in existed circle!')
            setComment('')
            setIsDirectPost(false)
            setTimeout(() => {
              setIsStatusMessage(false);
            }, 3000);
          }
          else {
            setStatusMessage('Creating Circle...')
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
                setStatusMessage('');
                setErrorMessage(res.error)
                setIsDirectPost(false)
              }
              if (res === true) {
                getCircleGenerationStatus();
              }
            })
          }
        }
      )
    } else {
      setErrorMessage('Please put your thought.')
    }
  }, [circleData?.tags, comment, currentTabId, currentTabTitle, currentUrl, getCircleGenerationStatus])

  useEffect(() => {
    if (circleGenerationStatus?.type === 'direct') {
      setIsStatusMessage(true)
      setComment(commentData)
      setIsDirectPost(true);
      setStatusMessage('Creating Circle...')
    }
    if (circleGenerationStatus?.type === 'direct' && circleGenerationStatus?.status === CircleGenerationStatus.SUCCEEDED) {
      setComment("");
      setIsDirectPost(false);
      setStatusMessage('Done!');
      setCommentData('');
      getCircles();
      chrome.runtime.sendMessage({
        action: BJActions.REMOVE_CIRCLES_FROM_STORAGE,
        tabId: currentTabId
      });
      chrome.runtime.sendMessage({
        action: BJActions.REMOVE_COMMENT_FROM_STORAGE,
      });
      setTimeout(() => {
        setIsStatusMessage(false);
      }, 3000);
    }
  }, [circleData.tags, circleGenerationStatus, commentData, currentTabId, currentTabTitle, currentUrl, getCircles, setCommentData])

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
      {isStatusMessage && <p className="text-brand text-xs leading-5 font-medium px-3">{statusMessage}</p>}
      <div className="w-full flex flex-col gap-y-4">
        <div className="w-full px-2 pt-2 flex justify-between items-center">
          <div className={classNames("flex flex-row gap-2 px-3 items-center py-2 hover:bg-brand/10 hover:rounded-2xl transition-all duration-300", {
            'bg-transparent hover:bg-transparent': showCircles,
            'cursor-pointer': !showCircles
          })} onClick={showCircles ? undefined : handleSendIconClick}>
            <p className="text-base leading-5 font-semibold text-brand">{commentBoxTitle}</p>
            { !showCircles && (isDirectPost ? <LoadingSpinner size={20} /> : <div className="text-brand"><Send className='w-5 h-5' /></div>) }
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
