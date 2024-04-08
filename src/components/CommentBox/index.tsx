import { ChangeEvent, useCallback, useState } from "react"

import Send from "../SVGIcons/Send"
import XIcon from "../SVGIcons/XIcon"
import LoadingSpinner from "../LoadingSpinner"


interface ICommentBox {
  onShare: (comment: string) => void
  onClose: () => void
  isSharing: boolean
}

const CommentBox = ({ onShare, onClose, isSharing }: ICommentBox) => {
  const [comment, setComment] = useState('')

  const handleCommentChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value)
  }, [])

  const handleSendIconClick = useCallback(() => {
    onShare(comment)
  }, [comment, onShare])

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
          <p className="text-base font-semibold leading-normal text-brand">{`${isSharing ? 'Sharing' : 'Share'}`} to</p>
          {isSharing ?
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
