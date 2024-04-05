import { useCallback, useState } from 'react'

import { CircleInterface } from '../../types/circle'
import RoundedButton from '../Buttons/RoundedButton'
import { useCircleContext } from '../../context/CircleContext'
import { BJActions } from '../../background/actions'

interface ILinkCircleItem {
  circle: CircleInterface
  url: string
}

const LinkCircleItem = ({ circle, url }: ILinkCircleItem) => {
  const [isLinking, setIsLinking] = useState<boolean>(false)

  const { getCircles } = useCircleContext()

  const handleClaim = useCallback(
    (circleId: string) => {
      setIsLinking(true)
      chrome.runtime.sendMessage({ action: BJActions.CLAIM_CIRCLE, circleId, url }, (response) => {
        if (response) {
          getCircles()
        }
        setIsLinking(false)
      })
    },
    [getCircles, url]
  )

  return (
    <div className="p-3 transition-transform transform border border-stroke hover:bg-gray-100 flex gap-3 items-center rounded-2xl group hover:justify-between">
      <a
        href={`https://0xeden.com/circle/${circle.id}`}
        rel="noreferrer"
        target="_blank"
        className="cursor-pointer"
      >
        <img
          src={circle.circle_logo_image || `../duck.jpg`}
          alt="circle logo"
          className=" rounded-full min-w-[40px] h-10"
        />
      </a>
      <p className="text-ellipsis line-clamp-2 group-hover:hidden text-xs font-medium text-primary">
        {circle.name}
      </p>

      <div className="hidden group-hover:block">
        <RoundedButton
          disabled={isLinking}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClaim(circle.id)
          }}
        >
          {isLinking ? 'Linking' : 'Link'}
        </RoundedButton>
      </div>
    </div>
  )
}

export default LinkCircleItem
