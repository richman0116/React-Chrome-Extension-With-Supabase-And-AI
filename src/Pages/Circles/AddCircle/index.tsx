import { circlePageStatus } from "../../../utils/constants"
import { useCircleContext } from "../../../context/CircleContext"
import AddGeneratedCircles from "./AddGeneratedCircles"
import AddManualCircle from "./AddManualCircle"
import { useState } from "react"

export const initialCircleData = {
  id: "",
  name: "",
  description: "",
  tags: [""],
  circle_logo_image: ""
}

const AddCircle = () => {
  const { pageStatus } = useCircleContext()
  const [circleData, setCircleData] = useState(initialCircleData)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {pageStatus === circlePageStatus.ADD_AUTOMATICALLY && <AddGeneratedCircles setCircleData={setCircleData}  />}
      {pageStatus === circlePageStatus.ADD_MANUALLY && <AddManualCircle circleData={circleData} setCircleData={setCircleData} />}
    </div>
  )
}

export default AddCircle
