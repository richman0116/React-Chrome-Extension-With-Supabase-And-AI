import { ChangeEvent, useCallback, useState } from "react"

import Send from "../SVGIcons/Send"
import XIcon from "../SVGIcons/XIcon"
import LoadingSpinner from "../LoadingSpinner"


interface ICommentBox {
  circleImageUrl: string
  onComment: (comment: string) => void
  onClose: () => void
  isCommenting: boolean
}

const CommentBox = ({ circleImageUrl, onComment, onClose, isCommenting }: ICommentBox) => {
  const [comment, setComment] = useState('')

  const handleCommentChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value)
  }, [])

  const handleSendIconClick = useCallback(() => {
    onComment(comment)
  }, [comment, onComment])

  return (
    <div className="w-[333px] rounded-2xl bg-branding pb-5">
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
          <div className="flex items-center gap-x-2">
            <p className="text-base font-semibold leading-normal text-brand">{`${isCommenting ? 'Sharing' : 'Share'}`} to</p>
            <img
              src={circleImageUrl || `../duck.jpg`}
              alt="circle logo"
              className=" rounded-full min-w-[24px] h-6"
            />
          </div>
          {isCommenting ?
            <LoadingSpinner size={24} />
            :
            <div className="flex gap-x-2">
              <div className="cursor-pointer text-brand" onClick={handleSendIconClick}><Send /></div>
              <div className="cursor-pointer text-brand" onClick={onClose}><XIcon width={24} height={24} /></div>
            </div>}
        </div>
      </div>
    </div>
  )
}

export default CommentBox
