import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

import Button from '../../../../components/Buttons/Button'
import { useCircleContext } from '../../../../context/CircleContext'
import { CircleInterface } from '../../../../types/circle'
import { getCircleLoadingMessage, getSpecificNumberOfWords } from '../../../../utils/helpers'
import { circlePageStatus } from '../../../../utils/constants'
import AutoCircleItem from '../../../../components/AutoCircleItem'
import CreationHeader from '../../../../components/CreationHeader'
import GenerateButton from '../../../../components/Buttons/GenerateButton'
import Refresh from '../../../../components/SVGIcons/Refresh'
import RecommendedCircles from './RecommendedCircles'

interface IAddGeneratedCircles {
  setCircleData: Dispatch<SetStateAction<CircleInterface>>
  generatedCircles: CircleInterface[]
  setGeneratedCircles: Dispatch<SetStateAction<CircleInterface[]>>
}

const AddGeneratedCircles = ({ setCircleData, generatedCircles: circles, setGeneratedCircles: setCircles }: IAddGeneratedCircles) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isFailed, setIsFailed] = useState(false)

  const { currentUrl: url, setPageStatus } = useCircleContext()

  const tags: string[] = useMemo(() => {
    const allTags = circles.map((circle) => circle.tags).flat()
    return allTags.filter((tag, index, array) => array.indexOf(tag) === index)
  }, [circles])

  const getCircles = useCallback(() => {
    setIsLoading(true)
    setCircles([])
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage(
        { action: 'getPageContent', tabId: tabs[0].id },
        (response) => {
          chrome.runtime.sendMessage(
            {
              action: 'getGeneratedCircles',
              pageUrl: url,
              pageContent: response,
            },
            (res1) => {
              console.log('Generated circles: ', res1)
              if (res1?.error && res1?.error === 'context_length_exceeded') {
                const limitedWords = getSpecificNumberOfWords(response, 5000)
                chrome.runtime.sendMessage(
                  {
                    action: 'getGeneratedCircles',
                    pageUrl: url,
                    pageContent: limitedWords,
                  },
                  (res2) => {
                    console.log('Generated circles with limited words: ', res2)
                    if (res2.length >= 5) {
                      setIsFailed(false)
                      setCircles(res2)
                    } else {
                      setIsFailed(true)
                    }
                    setIsLoading(false)
                  }
                )
              } else {
                if (res1.length >= 5) {
                  setIsFailed(false)
                  setCircles(res1)
                } else {
                  setIsFailed(true)
                }
                setIsLoading(false)
              }
            }
          )
        }
      )
    })
  }, [setCircles, url])

  useEffect(() => {
    if (circles.length === 0) {
      getCircles()
    }
  }, [circles.length, getCircles])

  const handleAddClick = useCallback(
    (circleData: CircleInterface) => {
      setCircleData({
        ...circleData,
        tags,
      })
      setPageStatus(circlePageStatus.ADD_MANUALLY)
    },
    [setCircleData, setPageStatus, tags]
  )

  const handleManualClick = useCallback(() => {
    setPageStatus(circlePageStatus.ADD_MANUALLY)
  }, [setPageStatus])

  return (
    <div className="w-full h-full flex flex-col items-center gap-5 overflow-y-auto overflow-x-hidden scrollbar-none">
      <CreationHeader
        title="Create Circle"
        onBack={() => setPageStatus(circlePageStatus.CIRCLE_LIST)}
      />
      <div className="w-full mb-20">
        <div className="w-full flex flex-col gap-2 justify-between">
          {isLoading && (
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-gray-600 flex flex-col gap-y-3">
              <div className="-mt-6">
                <p className="text-sm font-medium leading-normal text-center text-brand">Running on background</p>
                <p className="text-base font-medium leading-normal text-center text-primary">{getCircleLoadingMessage()}...</p>
                <div className='h-1.5 w-full bg-secondary overflow-hidden rounded-xl'>
                  <div className='animate-progress w-full h-full bg-brand origin-left-right rounded-xl' />
                </div>
                </div>
            </div>
          )}

          {!isLoading && isFailed && (
            <div className="w-full h-80 flex flex-col items-center justify-center">
              <p className="text-sm font-medium leading-normal text-center text-red-400">Something went wrong!</p>
            </div>
          )}

          {!isLoading && circles.length > 0 && (
            <div className="w-full flex flex-col gap-1">
              {circles.map((circle, index) => (
                <AutoCircleItem
                  key={index}
                  circle={circle}
                  url={url}
                  onAdd={() => handleAddClick(circle)}
                />
              ))}
            </div>
          )}
          {!isLoading && (
            <div className="w-full flex justify-center">
              <GenerateButton type="button" onClick={getCircles}>
                <Refresh />
                <p>Generate {circles.length > 0 ? 'New' : ''}</p>
              </GenerateButton>
            </div>
          )}
          <RecommendedCircles circles={circles} tags={tags} />
        </div>
      </div>
      <div className="fixed bottom-6 w-fit justify-center flex flex-col gap-5">
        <Button onClick={handleManualClick}>Create manually</Button>
      </div>
    </div>
  )
}

export default AddGeneratedCircles
