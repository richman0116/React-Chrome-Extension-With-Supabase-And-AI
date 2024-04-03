import { ChangeEvent, useCallback, useMemo, useState } from "react"

import CreateCircleItem from "../CreateCircleItem"
import ShareCircleItem from "../ShareCircleItem"
import Send from "../SVGIcons/Send"
import XIcon from "../SVGIcons/XIcon"
import { useCircleContext } from "../../context/CircleContext"
import { BJActions } from "../../background/actions"
import LoadingSpinner from "../LoadingSpinner"

const CommentBox = () => {
  const [comment, setComment] = useState('')
  const [showCircles, setShowCircles] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isFailed, setIsFailed] = useState(false)

  const { circles } = useCircleContext()

  const commentBoxTitle = useMemo(() => {
    if (showCircles) {
      return "Choose a circle to share"
    } else {
      if (circles.length > 0) {
        return "Share to circle"
      } else {
        return "SHare ideas & create circle"
      }
    }
  }, [circles.length, showCircles])

  const handleCommentChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value)
  }, [])

  const handleSendIconClick = useCallback(() => {
    if (comment.length > 0) {
      setShowCircles(true)
    }
  }, [comment.length])

  const handleShare = useCallback((circleId: string) => {
    setIsSharing(true)
    chrome.runtime.sendMessage(
      {
        action: BJActions.CREATE_POST,
        context: comment,
        circleId
      },
      (res) => {
        if (res.error) {
          setIsFailed(true)
        } else {
          setIsFailed(false)
          setComment("")
          setShowCircles(false)
        }
        setIsSharing(false)
      }
    )
  }, [comment])

  return (
    <div className="w-full rounded-2xl bg-branding pb-5">
      <div className="pt-1 px-1">
        <input
          type="text"
          placeholder="Any thoughts?"
          value={comment}
          onChange={handleCommentChange}
          className="p-4 w-full rounded-2xl text-primary placeholder-tertiary text-base font-normal leading-normal"
        />
      </div>
      <div className="w-full flex flex-col gap-y-4">
        <div className="w-full pt-4 px-5 flex justify-between items-center">
          <p className="text-base font-semibold leading-normal text-brand">{commentBoxTitle}</p>
          {showCircles ?
            <div className="cursor-pointer" onClick={() => setShowCircles(false)}><XIcon /></div>
            :
            <div className="cursor-pointer text-brand" onClick={handleSendIconClick}><Send /></div>
          }
        </div>
        {isFailed && <p className="text-sm font-medium leading-normal text-center text-alert">Something went wrong!</p>}
        {!isSharing && showCircles && <div className="px-2">
          <CreateCircleItem />
          <div className="w-full grid grid-cols-2 gap-2 pt-2">
            {circles.map((circle) => <ShareCircleItem circle={circle} key={circle.id} onShare={handleShare} />)}
          </div>
        </div>}
        {isSharing && <div className="w-full flex items-center justify-center"><LoadingSpinner /></div>}
      </div>
    </div>
  )
}

export default CommentBox
