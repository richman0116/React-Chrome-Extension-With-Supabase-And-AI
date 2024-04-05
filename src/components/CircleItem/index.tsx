import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

import { CircleInterface } from '../../types/circle'
import RoundedButton from '../Buttons/RoundedButton'
import { BJActions } from '../../background/actions'
import LoadingSpinner from '../LoadingSpinner'
import MessageIcon from '../SVGIcons/MessageIcon/MessageIcon'

interface CircleItemInterface {
  circle: CircleInterface
  url: string
  setPageStatus?: Dispatch<SetStateAction<number>>
}

const CircleItem = ({
  circle,
  url,
}: CircleItemInterface) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isJoined, setIsJoined] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const checkIfJoined = useCallback(async () => {
    chrome.runtime.sendMessage(
      { action: BJActions.CHECK_IF_USER_JOINED_CIRCLE, circleId: circle.id },
      (response) => {
        setIsJoined(response)
        setIsChecking(false)
      }
    )
  }, [circle.id])

  useEffect(() => {
    checkIfJoined()
  }, [checkIfJoined])

  const handleJoin = useCallback(
    (circleId: string) => {
      setIsJoining(true)
      chrome.runtime.sendMessage({ action: BJActions.JOIN_CIRCLE, circleId, url }, (response) => {
        if (response === true) {
          checkIfJoined()
        }
        setIsJoining(false)
      })
    },
    [checkIfJoined, url]
  )

  return (
    <div className=" relative p-4 transition-transform transform border border-stroke hover:bg-gray-100 flex gap-4 items-center rounded-2xl group">
      {isJoined && <div className="absolute top-0 left-0 bg-brand rounded-tl-2xl rounded-br-2xl py-1 px-2">
        <p className="text-xs font-bold leading-normal text-white">Joined</p>
      </div>}
      <a
        href={`https://0xeden.com/circle/${circle.id}`}
        rel="noreferrer"
        target="_blank"
        className="cursor-pointer"
      >
        <img
          src={circle.circle_logo_image || `../duck.jpg`}
          alt="circle logo"
          className=" rounded-full min-w-[48px] h-12"
        />
      </a>
      <div className="w-full flex items-center">
        <div className="flex flex-col justify-between gap-1 group-hover:text-gray-900 w-full">
          <div className="flex justify-between items-center w-full">
            <p
              className="text-base font-bold text-primary line-clamp-1"
              title={circle.name}
            >
              {circle.name}
            </p>
          </div>
          <p
            className="text-ellipsis line-clamp-2 text-sm font-medium text-tertiary"
            title={circle.description}
          >
            {circle.description}
          </p>
        </div>
      </div>

      {isChecking ? <LoadingSpinner size={20} />
        :
        isJoined ?
          <div className="cursor-pointer text-tertiary hover:text-gray-500">
            <MessageIcon />
          </div>
          :
          <RoundedButton
            disabled={isJoining}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleJoin(circle.id)
            }}
          >
            {isJoining ? 'Joining' : 'Join'}
          </RoundedButton>
      }
    </div>
  )
}

export default CircleItem
