import { useCallback, useEffect, useState, useMemo } from 'react'

import LoadingSpinner from '../../../../components/LoadingSpinner'
import { CircleInterface } from '../../../../types/circle'
import classNames from 'classnames'
import LinkCircleItem from '../../../../components/LinkCircleItem'
import { useCircleContext } from '../../../../context/CircleContext'
import { BJActions } from '../../../../background/actions'
import LinkCommentBox from '../../../../components/LinkCommentBox'

const MyCircles = () => {
  const [userCircles, setUserCircles] = useState<CircleInterface[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [isCheckingIfSentComment, setIsCheckingIfSentComment] = useState<boolean>(false)
  const [isShowingLinkCommentBox, setIsShowingLinkCommentBox] = useState<boolean>(false)

  const {
    currentUrl: url,
    currentPageCircleIds,
  } = useCircleContext()

  const getUserCircles = useCallback(async () => {
    if (url !== '') {
      chrome.runtime.sendMessage({ action: BJActions.GET_USER_CIRCLES }, (response) => {
        if (response.error) {
          setUserCircles([])
          setIsLoading(false)
        } else {
          if (response.data) {
            setUserCircles(response.data)
            setIsLoading(false)
          } else {
            setUserCircles([])
            setIsLoading(false)
          }
        }
      })
    }
  }, [url])

  useEffect(() => {
    getUserCircles()
  }, [getUserCircles])

  const linkSectionItems = useMemo((): {
    item: CircleInterface
    index?: number
    isLinkCommentBox: boolean
  }[] => {
    const circleItems = userCircles.filter(
      (userCircle) => !currentPageCircleIds.includes(userCircle.id)
    )
    const circleSectionItem = circleItems.map((item, index) => ({
      item: item,
      index,
      isLinkCommentBox: false,
    }))

    if (activeIndex >= 0) {
      const insertIndex = activeIndex + (activeIndex % 2 === 0 ? 2 : 1)

      const newSectionItems = []

      newSectionItems.push(...circleSectionItem.slice(0, insertIndex))
      newSectionItems.push({
        item: circleItems[activeIndex] as unknown as CircleInterface,
        isLinkCommentBox: true,
      })
      newSectionItems.push(...circleSectionItem.slice(insertIndex))

      // console.log(newSectionItems, activeIndex, insertIndex, newSectionItems.length);
      
      return newSectionItems
    } else {
      return circleSectionItem
    }
  }, [activeIndex, currentPageCircleIds, userCircles])

  const resultText = useMemo(() => {
    if (!isLoading && linkSectionItems.length > 0) {
      if (linkSectionItems.length > 0) {
        return 'Link ur Circles to this page'
      } else {
        return ''
      }
    }
  }, [isLoading, linkSectionItems])


  useEffect(() => {
    chrome.runtime.connect({name: "popup"})
  },[])

  return (
    <div
      className={classNames('w-full flex flex-col justify-between mb-20', {
        hidden: linkSectionItems.length === 0,
      })}
    >
      <div className="w-full">
        {!isLoading && (
          <p className="text-xl font-medium text-primary pb-3">{resultText}</p>
        )}
      </div>
      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-black py-4 ">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && linkSectionItems.length > 0 && (
        <div className="w-full gap-2 grid grid-cols-2">
          {linkSectionItems.map((item, index) => {
            if (item.isLinkCommentBox && isShowingLinkCommentBox) {
              return <div className='col-start-1 col-span-2'>
                <LinkCommentBox circle={item.item as CircleInterface} isCheckingIfSentComment={isCheckingIfSentComment} setIsCheckingIfSentComment={setIsCheckingIfSentComment} setIsShowingLinkCommentBox={setIsShowingLinkCommentBox} setActiveIndex={setActiveIndex} />
              </div>
            }
            return (
              <div key={index}>
                <LinkCircleItem
                  circle={item.item as CircleInterface}
                  linkCommentBoxIndex={item.index as number}
                  setActiveIndex={setActiveIndex}
                  isCheckingIfSentComment={isCheckingIfSentComment}
                  setIsCheckingIfSentComment={setIsCheckingIfSentComment}
                  setIsShowingLinkCommentBox={setIsShowingLinkCommentBox}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
export default MyCircles

