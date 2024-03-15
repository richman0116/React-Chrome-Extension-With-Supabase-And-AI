import { circlePageStatus } from '../../../utils/constants'
import { useCircleContext } from '../../../context/CircleContext'
import AddGeneratedCircles from './AddGeneratedCircles'
import AddManualCircle from './AddManualCircle'
import { useEffect, useState } from 'react'
import { CircleInterface } from '../../../types/circle'

export const initialCircleData = {
  id: '',
  name: '',
  description: '',
  tags: [''],
  circle_logo_image: '',
}

const AddCircle = () => {
  const { pageStatus, isGeneratingCircles } = useCircleContext()
  const [circleData, setCircleData] = useState(initialCircleData)
  const [generatedCircles, setGeneratedCircles] = useState<CircleInterface[]>([])
  const [isLoadingCirclesFromStorage, setIsLoadingCirclesFromStorage] = useState(false)

  useEffect(() => {
    const getCirclesFromStorage = () => {
      if (!isGeneratingCircles) {
        setIsLoadingCirclesFromStorage(false)
        chrome.runtime.sendMessage(
          {
            action: 'getCirclesFromStorage'
          },
          (res: CircleInterface[]) => {
            if (res.length > 0) {
              setGeneratedCircles(res)
            }
            setIsLoadingCirclesFromStorage(false)
          }
        )
      }
    }

    getCirclesFromStorage()
  }, [isGeneratingCircles])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {pageStatus === circlePageStatus.ADD_AUTOMATICALLY && !isLoadingCirclesFromStorage && (
        <AddGeneratedCircles setCircleData={setCircleData} generatedCircles={generatedCircles} setGeneratedCircles={setGeneratedCircles} />
      )}
      {pageStatus === circlePageStatus.ADD_MANUALLY && (
        <AddManualCircle circleData={circleData} setCircleData={setCircleData} />
      )}
    </div>
  )
}

export default AddCircle
