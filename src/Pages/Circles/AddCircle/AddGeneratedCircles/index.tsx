import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'

import Button from '../../../../components/Buttons/Button'
import { useCircleContext } from '../../../../context/CircleContext'
import { CircleInterface } from '../../../../types/circle'
import { getCircleLoadingMessage } from '../../../../utils/helpers'
import { CircleGenerationStatus, circlePageStatus } from '../../../../utils/constants'
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
  const [message, setMessage] = useState(getCircleLoadingMessage());

  const { currentUrl: url, currentTabId, setPageStatus, circleGenerationStatus, setCircleGenerationStatus, getCircleGenerationStatus } = useCircleContext()

  useEffect(() => {
    if (circleGenerationStatus?.status === CircleGenerationStatus.SUCCEEDED) {
      setCircles(circleGenerationStatus?.result)
    }
  }, [circleGenerationStatus?.result, circleGenerationStatus?.status, setCircles])

  const tags: string[] = useMemo(() => {
    const allTags = circles.map((circle) => circle.tags).flat()
    return allTags.filter((tag, index, array) => array.indexOf(tag) === index)
  }, [circles])

  useEffect(() => {
    if (circleGenerationStatus?.status === CircleGenerationStatus.GENERATING) {
      setIsLoading(true)
    } else if (circleGenerationStatus?.status === CircleGenerationStatus.FAILED) {
      setIsFailed(true)
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [circleGenerationStatus?.status])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(getCircleLoadingMessage());
    }, 3000); // Change message every 3 seconds
    if (!isLoading) {
      clearInterval(intervalId); // clean up the interval if loading circles finished
    }

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [isLoading]); // Empty dependency array means this effect runs once on mount

  const getCircles = useCallback(() => {
    setIsLoading(true)
    setCircles([])
    if (currentTabId) {
      chrome.runtime.sendMessage(
        { action: 'getPageContent', tabId: currentTabId },
        (response) => {
          chrome.runtime.sendMessage(
            {
              action: 'generatedCircles',
              pageUrl: url,
              pageContent: response,
              tabId: currentTabId
            },
            (res: boolean) => {
              if (res) {
                getCircleGenerationStatus()
              }
            }
          )
        }
      )
    }
  }, [currentTabId, getCircleGenerationStatus, setCircles, url])

  useEffect(() => {
    if (circles.length === 0 && !circleGenerationStatus) {
      getCircles()
    }
  }, [circleGenerationStatus, circles.length, getCircles])

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

  const handlePrevClick = useCallback(() => {
    chrome.runtime.sendMessage(
      {
        action: "removeCirclesFromStorage",
        tabId: currentTabId
      },
      (res) => {
        if (res) {
          setCircleGenerationStatus(null)
          setPageStatus(circlePageStatus.CIRCLE_LIST)
        }
      }
    )
  }, [currentTabId, setCircleGenerationStatus, setPageStatus])

  const handleManualClick = useCallback(() => {
    setPageStatus(circlePageStatus.ADD_MANUALLY)
  }, [setPageStatus])

  return (
    <div className="w-full h-full flex flex-col items-center gap-5 overflow-y-auto overflow-x-hidden scrollbar-none">
      <CreationHeader
        title="Create Circle"
        onBack={handlePrevClick}
      />
      <div className="w-full mb-20">
        <div className="w-full flex flex-col gap-2 justify-between">
          {isLoading && (
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-gray-600 flex flex-col gap-y-3">
              <div className="-mt-6">
                <p className="text-sm font-medium leading-normal text-center text-brand">Running on background</p>
                <p className="text-base font-medium leading-normal text-center text-primary">{message}...</p>
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
