import Send from "../SVGIcons/Send"
import { CircleInterface } from "../../types/circle"
import { Dispatch, SetStateAction, useCallback, useState } from "react"
import { BJActions } from "../../background/actions"
import LoadingSpinner from "../LoadingSpinner"
import CheckIcon from "../SVGIcons/CheckIcon"

interface IShareCircleItem {
  circle: CircleInterface
  comment: string
  setComment: Dispatch<SetStateAction<string>>
  setShowCircles: Dispatch<SetStateAction<boolean>>
}

const ShareCircleItem = ({ circle, comment, setComment, setShowCircles }: IShareCircleItem) => {
  const [isSharing, setIsSharing] = useState(false)
  const [isShared, setIsShared] = useState(false)

  const handleShare = useCallback(() => {
    setIsSharing(true)
    chrome.runtime.sendMessage(
      {
        action: BJActions.CREATE_POST,
        context: comment,
        circleId: circle.id
      },
      (res) => {
        if (!res.error) {
          setComment("")
          setIsSharing(false)
          setIsShared(true)
          setTimeout(() => {
            setIsShared(false)
            setShowCircles(false)
          }, 1000)
        }
      }
    )
  }, [circle.id, comment, setComment, setShowCircles])

  return (
    <button
      className="w-full flex justify-center items-center rounded-full px-3 py-4 bg-white hover:bg-brand cursor-pointer group"
      type="button"
      onClick={handleShare}
    >
      {isSharing ?
        <LoadingSpinner size={20} />
        :
        <div className="w-full flex justify-between items-center">
          <img
            src={circle.circle_logo_image || `../duck.jpg`}
            alt="circle logo"
            className=" rounded-full min-w-[24px] h-6"
          />
          <p
            className="w-full text-ellipsis line-clamp-1 text-xs font-bold leading-normal text-primary group-hover:text-white"
            title={circle.name}
          >
            {circle.name}
          </p>
          <span className="text-white hidden group-hover:block">
            {isShared ? <CheckIcon /> : <Send />}
          </span>
        </div>}
    </button>
  )
}

export default ShareCircleItem
