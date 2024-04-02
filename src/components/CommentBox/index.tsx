import { ChangeEvent, useCallback, useState } from "react"
import Send from "../SVGIcons/Send"

const CommentBox = () => {
  const [comment, setComment] = useState('')

  const handleComment = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value)
  }, [])


  return (
    <div className="w-full rounded-2xl bg-branding">
      <div className="pt-1 px-1">
        <input
          type="text"
          placeholder="Any thoughts?"
          value={comment}
          onChange={handleComment}
          className="p-4 w-full rounded-2xl text-primary placeholder-tertiary text-base font-normal leading-normal"
        />
      </div>
      <div className="w-full flex flex-col gap-y-4">
        <div className="w-full pt-4 px-5 flex justify-between items-center">
          <p className="text-base font-semibold leading-normal text-brand">Share ideas & create circle</p>
          <Send />
        </div>
        <div className="px-2">

        </div>
      </div>
    </div>
  )
}

export default CommentBox
