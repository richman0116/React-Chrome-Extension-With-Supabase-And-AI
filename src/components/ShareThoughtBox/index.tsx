import { ChangeEvent, useCallback, useMemo, useState } from "react"

import CreateCircleItem from "../CreateCircleItem"
import ShareCircleItem from "../ShareCircleItem"
import Send from "../SVGIcons/Send"
import XIcon from "../SVGIcons/XIcon"
import Chevron from '../SVGIcons/Chevron'
import CircleIcon from "../SVGIcons/CircleIcon"
import { useCircleContext } from "../../context/CircleContext"
import LoadingSpinner from "../LoadingSpinner"

const ShareThoughtBox = () => {
  const [comment, setComment] = useState('')
  const [showCircles, setShowCircles] = useState(false)
  const [isDirectPost, setIsDirectPost] = useState(false)

  const { circles } = useCircleContext()

  const commentBoxTitle = useMemo(() => {
    if (showCircles) {
      return "Choose a circle to share"
    } else {
      return "Send"
    }
  }, [showCircles])

  const handleCommentChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value)
  }, [])

  const handleSendIconClick = useCallback(() => {
    if (comment.length > 0) {
      setShowCircles(true)
    }
  }, [comment.length])

  const handleCircleIconClick = useCallback(() => {
    if (comment.length > 0) {
      setIsDirectPost(true)
      // chrome.runtime.sendMessage(
      //   {
      //     action: BJActions.CREATE_CIRCLE_WITH_SITE_URL_AND_SEND_COMMENT,
      //     context: comment,
      //   },
      //   (res) => {
          
      //   }
      // )

    }
  }, [comment.length])

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
        <div className="w-full pt-4 pl-5 pr-2 flex justify-between items-center">
          <div className="flex flex-row gap-2">
            <p className="text-base font-semibold leading-normal text-brand">{commentBoxTitle}</p>
            { showCircles ? '' : <div className="cursor-pointer text-brand" onClick={handleSendIconClick}><Send /></div> }
          </div>
          <div className="flex px-3 py-2 rounded-2xl items-center justify-center gap-2 bg-brand/10">
            <div className="cursor-pointer text-brand" onClick={handleCircleIconClick}>
              {isDirectPost ?
                <LoadingSpinner size={20} />
                :
                <CircleIcon width="20" height="20" viewBox="0 0 20 20" color="#134D2E" />}
            </div>
            {
              showCircles ? 
                <div className="cursor-pointer text-brand" onClick={() => setShowCircles(false)}><XIcon /></div>
                :
                <div className="cursor-pointer text-brand" onClick={() => setShowCircles(true)}><Chevron width="16" height="16" color="#134D2E" viewBox="0 0 16 16" /></div>
            }
            
          </div>
        </div>
        {showCircles && <div className="px-2">
          <CreateCircleItem comment={comment} />
          <div className="w-full grid grid-cols-2 gap-2 pt-2">
            {circles.map((circle) => <ShareCircleItem circle={circle} key={circle.id} comment={comment} setComment={setComment} setShowCircles={setShowCircles} />)}
          </div>
        </div>}
      </div>
    </div>
  )
}

export default ShareThoughtBox
