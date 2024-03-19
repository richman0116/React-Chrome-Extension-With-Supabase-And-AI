import { useCallback, useEffect, useState, useMemo } from 'react'

import CircleItem from '../../../../../components/CircleItem'
import { CircleInterface } from '../../../../../types/circle'
import { useCircleContext } from '../../../../../context/CircleContext'

interface IRecommendedCircles {
  circles: CircleInterface[]
  tags: string[]
}

const RecommendedCircles = ({ circles, tags }: IRecommendedCircles) => {
  const { currentUrl: url } = useCircleContext()
  const [recommendedCircles, setRecommendedCircles] = useState<CircleInterface[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getRecommendedCircles = useCallback(() => {
    setIsLoading(true)
    chrome.runtime.sendMessage(
      {
        action: 'getSimilarCirclesFromTags',
        tags,
      },
      (response) => {
        setRecommendedCircles(response)
        setIsLoading(false)
      }
    )
  }, [tags])

  useEffect(() => {
    if (tags.length > 0) {
      getRecommendedCircles()
    }
  }, [tags, getRecommendedCircles])

  const resultText = useMemo(() => {
    if (circles.length > 0 && !isLoading) {
      if (recommendedCircles.length > 0) {
        return 'Recommended circles'
      } else {
        return 'There are no recommended circles'
      }
    }
  }, [circles.length, isLoading, recommendedCircles.length])

  return (
    <div className="w-full flex flex-col justify-between gap-3">
      {isLoading && (
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-medium leading-normal text-center text-brand pb-5">Getting Recommended Circles</p>
          <div className='h-1.5 bg-secondary overflow-hidden rounded-xl mx-32'>
            <div className='animate-progress w-full h-full bg-brand origin-left-right rounded-xl' />
          </div>
        </div>
      )}
      <div className="w-full">
        {!isLoading && <p className="text-xl font-medium text-primary">{resultText}</p>}
      </div>

      {!isLoading && circles.length > 0 && recommendedCircles.length > 0 && (
        <div className="w-full flex flex-col gap-1">
          {recommendedCircles.map((recommendCircle, index) => (
            <CircleItem key={index} circle={recommendCircle} url={url} />
          ))}
        </div>
      )}
    </div>
  )
}
export default RecommendedCircles
