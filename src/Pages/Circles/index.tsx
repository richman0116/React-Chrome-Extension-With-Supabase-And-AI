import { circlePageStatus } from "../../utils/constants"
import CircleList from "./CircleList"
import { useCircleContext } from "../../context/CircleContext"
import AddCircles from "./AddCircle"

const Circles = () => {
  const { pageStatus } = useCircleContext()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {pageStatus === circlePageStatus.CIRCLE_LIST && <CircleList />}
      {pageStatus === circlePageStatus.ADD_AUTOMATICALLY && <AddCircles />}
    </div>
  )
}

export default Circles
