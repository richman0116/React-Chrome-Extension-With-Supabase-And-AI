import { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from "react"
import Send from "../SVGIcons/Send"
import CheckIcon from "../SVGIcons/CheckIcon"
import { BJActions } from "../../background/actions"
import { useCircleContext } from "../../context/CircleContext"
import { CircleInterface } from "../../types/circle"
import XIcon from "../SVGIcons/XIcon"

interface ILinkCommentBox {
  circle: CircleInterface
  isCheckingIfSentComment: boolean
  setIsCheckingIfSentComment: Dispatch<SetStateAction<boolean>>
  setIsShowingLinkCommentBox: Dispatch<SetStateAction<boolean>>
  setActiveIndex: Dispatch<SetStateAction<number>>
}

const LinkCommentBox = ({circle, isCheckingIfSentComment, setIsCheckingIfSentComment, setIsShowingLinkCommentBox, setActiveIndex}: ILinkCommentBox) => {
  
  const [comment, setComment] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const { getCircles, currentUrl } = useCircleContext()

  const handleSendIconClick = useCallback(() => {
    setIsCheckingIfSentComment(true)
    chrome.runtime.sendMessage({ action: BJActions.CLAIM_CIRCLE, context: comment, circleId: circle.id, url: currentUrl }, (response) => {
      if (response) {
        if (response.error) {
          setErrorMessage(response.error)
        }
        else {
          chrome.runtime.sendMessage({ action: BJActions.SAVE_LINK_STATUS_TO_STORAGE, url: currentUrl, circleId: circle.id, status: 'post' }, (res) => {
            if (res) {
              if (res.error) {
                setErrorMessage(res.error)
                console.log(res.error)
              }
              else {
                chrome.runtime.sendMessage({ action: BJActions.REMOVE_DATA_FOR_LINK }, (res) => {
                  if (res.error) {
                    console.log(res.error)                      
                  }
                  else {
                    setComment('')
                    setStatusMessage('done!');
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                      const url = tabs[0].url
                      chrome.runtime.sendMessage({ action: BJActions.SHOW_CIRCLE_COUNT, url }, (response) => {
                        if (response.message) console.log(response.message)
                        else console.log(response.error)
                      })
                    })
                    setTimeout(() => {
                      getCircles()
                      setStatusMessage('');
                      setIsShowingLinkCommentBox(false)
                      setActiveIndex(-1);
                    }, 1500);
                  }
                })
              }
            }
          })
        }
      }
    })
  },[circle.id, comment, currentUrl, getCircles, setActiveIndex, setIsCheckingIfSentComment, setIsShowingLinkCommentBox])

  const onClose = useCallback(() => {
    chrome.runtime.sendMessage({ action: BJActions.REMOVE_DATA_FOR_LINK }, (res) => {
      if (res.error) {
        console.log(res.error)
      }
      else if(res) {
        setActiveIndex(-1)
        setIsShowingLinkCommentBox(false)
      }
    })
  },[setActiveIndex, setIsShowingLinkCommentBox])

  const handleCommentChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('')
    setComment(e.target.value)
  }

  return (
    <div className="w-[333px] rounded-2.5xl bg-branding pb-5">
      <div className="pt-1 px-1">
        <input
          type="text"
          placeholder="Any thoughts?"
          value={comment}
          onChange={handleCommentChange}
          className="p-4 w-full rounded-2xl text-primary placeholder-tertiary text-base font-normal leading-normal"
        />
      </div>
      {statusMessage && <p className="text-brand text-xs leading-5 font-medium px-3">{statusMessage}</p>}
      {errorMessage && <p className="text-alert text-xs leading-5 font-medium px-3">{errorMessage}</p>}
      <div className="w-full flex flex-col gap-y-4">
        <div className="w-full pt-4 px-5 flex justify-between items-center">
          <div className="flex items-center gap-x-2">
            <p className="text-base font-semibold leading-normal text-brand">{!isCheckingIfSentComment ? 'Share to' : 'Shared'}</p>
            <img
              src={circle.circle_logo_image || `../duck.jpg`}
              alt="circle logo"
              className=" rounded-full min-w-[24px] h-6"
            />
          </div>
          <div className="flex gap-x-2">
            {
              !isCheckingIfSentComment ?
              <div className="cursor-pointer text-brand" onClick={handleSendIconClick}><Send /></div>
                :
              <div className="text-brand"><CheckIcon color="#134D2E"/></div>
            }
            <div className="cursor-pointer text-brand" onClick={onClose}><XIcon width={24} height={24} /></div> 
          </div>
        </div>
      </div>
    </div>
  )
}

export default LinkCommentBox
