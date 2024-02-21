import AddGeneratedCircles from "./AddGeneratedCircles"
import AddManualCircle from "./AddManualCircle"
import { useCircleContext } from "../../../context/CircleContext"
import { circlePageStatus } from "../../../utils/constants"

const AddCircles = () => {
  const { pageStatus } = useCircleContext()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {pageStatus === circlePageStatus.ADD_AUTOMATICALLY && <AddGeneratedCircles />}
      {pageStatus === circlePageStatus.ADD_MANUALLY && <AddManualCircle />}
    </div>
  )
}

export default AddCircles
