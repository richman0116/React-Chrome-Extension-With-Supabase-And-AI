import { Dispatch, SetStateAction, useCallback } from 'react'

import { CircleInterface } from '../../types/circle'
import RoundedButton from '../Buttons/RoundedButton'
import { edenUrl } from '../../utils/constants'
import { BJActions } from '../../background/actions'
import { useCircleContext } from '../../context/CircleContext'

interface ILinkCircleItem {
  circle: CircleInterface
  linkCommentBoxIndex: number
  setActiveIndex: Dispatch<SetStateAction<number>>
  isCheckingIfSentComment: boolean
  setIsCheckingIfSentComment: Dispatch<SetStateAction<boolean>>
  setIsShowingLinkCommentBox: Dispatch<SetStateAction<boolean>>
}

const LinkCircleItem = ({ circle, linkCommentBoxIndex, setActiveIndex, isCheckingIfSentComment,setIsCheckingIfSentComment, setIsShowingLinkCommentBox }: ILinkCircleItem) => {

  const { currentUrl } = useCircleContext()

  const handleClaim = useCallback(
    () => {
      chrome.runtime.sendMessage({ action: BJActions.SAVE_LINK_STATUS_TO_STORAGE, url: currentUrl, circleId: circle.id, status: 'default' }, (res) => {
        if (res) {
          if (res.error) {
            console.log(res.error)
          }
          else {
            setActiveIndex(linkCommentBoxIndex)
            setIsCheckingIfSentComment(false)
            setIsShowingLinkCommentBox(true)
          }
        }
      })
    },
    [circle, currentUrl, linkCommentBoxIndex, setActiveIndex, setIsCheckingIfSentComment, setIsShowingLinkCommentBox]
  )

  return (
    <a
      href={`${edenUrl}/circle/${circle.id}`}
      rel="noreferrer"
      target="_blank"
      className="p-3 transition-transform transform hover:cursor-pointer border border-stroke hover:bg-gray-100 flex gap-3 items-center rounded-2xl group hover:justify-between"
    >
      <img
        src={circle.circle_logo_image || `../duck.jpg`}
        alt="circle logo"
        className=" rounded-full min-w-[40px] h-10"
      />
      <p className="text-ellipsis line-clamp-2 group-hover:hidden text-xs font-medium text-primary">
        {circle.name}
      </p>

      <div className="hidden group-hover:block">
        <RoundedButton
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClaim()
          }}
        >
          Link
        </RoundedButton>
      </div>
    </a>
  )
}

export default LinkCircleItem
