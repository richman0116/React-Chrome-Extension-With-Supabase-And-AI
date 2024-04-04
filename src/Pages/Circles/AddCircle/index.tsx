import { CircleGenerationStatus, circlePageStatus } from '../../../utils/constants'
import { useCircleContext } from '../../../context/CircleContext'
import AddGeneratedCircles from './AddGeneratedCircles'
import AddManualCircle from './AddManualCircle'
import { useEffect, useState } from 'react'
import { CircleInterface } from '../../../types/circle'



const AddCircle = () => {
  const { pageStatus, circleGenerationStatus, setCircleData } = useCircleContext()

  const [generatedCircles, setGeneratedCircles] = useState<CircleInterface[]>([])

  useEffect(() => {
    if (circleGenerationStatus?.status === CircleGenerationStatus.SUCCEEDED && circleGenerationStatus.type === 'auto') {
      setGeneratedCircles(circleGenerationStatus?.result)
    } else if (circleGenerationStatus?.status === CircleGenerationStatus.INITIALIZED && circleGenerationStatus?.type === 'manual') {
      setCircleData(circleGenerationStatus.result[0])
    }
  }, [circleGenerationStatus?.result, circleGenerationStatus?.status, circleGenerationStatus?.type, setCircleData])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-5">
      {pageStatus === circlePageStatus.ADD_AUTOMATICALLY && (
        <AddGeneratedCircles generatedCircles={generatedCircles} setGeneratedCircles={setGeneratedCircles} />
      )}
      {pageStatus === circlePageStatus.ADD_MANUALLY && (
        <AddManualCircle />
      )}
    </div>
  )
}

export default AddCircle
