import { CircleGenerationStatus, circlePageStatus } from '../../../utils/constants'
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
  const { pageStatus, circleGenerationStatus } = useCircleContext()
  const [circleData, setCircleData] = useState(initialCircleData)
  const [generatedCircles, setGeneratedCircles] = useState<CircleInterface[]>([])

  useEffect(() => {
    if (circleGenerationStatus?.status === CircleGenerationStatus.SUCCEEDED) {
      if (circleGenerationStatus?.type === "auto") {
        setGeneratedCircles(circleGenerationStatus?.result)
      }
    }
  }, [circleGenerationStatus?.result, circleGenerationStatus?.status, circleGenerationStatus?.type])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {pageStatus === circlePageStatus.ADD_AUTOMATICALLY && (
        <AddGeneratedCircles setCircleData={setCircleData} generatedCircles={generatedCircles} setGeneratedCircles={setGeneratedCircles} />
      )}
      {pageStatus === circlePageStatus.ADD_MANUALLY && (
        <AddManualCircle circleData={circleData} setCircleData={setCircleData} />
      )}
    </div>
  )
}

export default AddCircle
