import { ChangeEvent, useCallback, useMemo, useState } from "react"

import CreateCircleItem from "../CreateCircleItem"
import ShareCircleItem from "../ShareCircleItem"
import Send from "../SVGIcons/Send"
import XIcon from "../SVGIcons/XIcon"
import { useCircleContext } from "../../context/CircleContext"

const ShareThoughtBox = () => {
  const [comment, setComment] = useState('')
  const [showCircles, setShowCircles] = useState(false)

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
