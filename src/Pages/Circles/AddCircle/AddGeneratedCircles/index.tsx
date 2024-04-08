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
import { BJActions } from '../../../../background/actions'
import Plus from '../../../../components/SVGIcons/Plus'
import LoadingSpinner from '../../../../components/LoadingSpinner'
import XIcon from '../../../../components/SVGIcons/XIcon'

interface IAddGeneratedCircles {
  generatedCircles: CircleInterface[]
  setGeneratedCircles: Dispatch<SetStateAction<CircleInterface[]>>
}

const AddGeneratedCircles = ({ generatedCircles: circles, setGeneratedCircles: setCircles }: IAddGeneratedCircles) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isFailed, setIsFailed] = useState(false)
  const [message, setMessage] = useState(getCircleLoadingMessage());

  const { currentUrl: url, currentTabId, setPageStatus, circleGenerationStatus, setCircleGenerationStatus, getCircleGenerationStatus, setCircleData } = useCircleContext()

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
      setIsFailed(false)
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
        { action: BJActions.GET_PAGE_CONTENT, tabId: currentTabId },
        (response) => {
          chrome.runtime.sendMessage(
            {
              action: BJActions.GENERATE_CIRCLES,
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
    if (circles.length === 0 && (!circleGenerationStatus || circleGenerationStatus.type === 'manual')) {
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
        action: BJActions.REMOVE_CIRCLES_FROM_STORAGE,
        tabId: currentTabId
      },
      (res) => {
        if (res) {
          setPageStatus(circlePageStatus.CIRCLE_LIST)
        }
      }
    )
  }, [currentTabId, setPageStatus])

  const handleManualClick = useCallback(() => {
    chrome.runtime.sendMessage(
      {
        action: BJActions.SET_CIRCLE_GENERATION_STATUS,
        tabId: currentTabId,
        circleGenerationStatus: {
          type: 'manual',
          status: CircleGenerationStatus.INITIALIZED,
          result: [],
        }
      },
      (res: Boolean) => {
        if (res) {
          setCircleGenerationStatus({
            type: 'manual',
            status: CircleGenerationStatus.INITIALIZED,
            result: []
          })
          setPageStatus(circlePageStatus.ADD_MANUALLY)
        }
      }
    )

  }, [currentTabId, setCircleGenerationStatus, setPageStatus])

  return (
    isLoading ? <div className="w-full border-gray-600 flex flex-col gap-y-4">
      <div className="w-full flex items-center justify-between gap-x-5">
        <LoadingSpinner size={20} />
        <p className="text-sm font-bold leading-normal text-center text-primary">{message}...</p>
        <div onClick={handlePrevClick} className="cursor-pointer">
          <XIcon />
        </div>
      </div>
      <div className="flex gap-x-1 px-3 py-2 bg-secondary rounded-full w-fit cursor-pointer" onClick={handleManualClick}>
        <div className='text-primary'>
          <Plus />
        </div>
        <button className="text-xs text-primary font-bold leading-normal">Create manually</button>
      </div>
    </div>
      :
      <div className="w-full h-140 flex flex-col items-center gap-5 overflow-y-auto overflow-x-hidden scrollbar-none">
        <CreationHeader
          title="Create Circle"
          onBack={handlePrevClick}
        />
        <div className="w-full mb-20">
          <div className="w-full flex flex-col gap-2 justify-between">

            {!isLoading && isFailed && (
              <div className="w-full h-80 flex flex-col items-center justify-center">
                <p className="text-sm font-medium leading-normal text-center text-alert">Something went wrong!</p>
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
