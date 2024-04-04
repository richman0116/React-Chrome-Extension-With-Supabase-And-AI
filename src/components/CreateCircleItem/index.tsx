import { useCallback } from "react"

import { initialCircleData } from "../../context/CircleContext"
import { useCircleContext } from "../../context/CircleContext"
import Plus from "../SVGIcons/Plus"
import { circlePageStatus } from "../../utils/constants"


interface ICreateCircleItem {
  comment: string
}

const CreateCircleItem = ({ comment }: ICreateCircleItem) => {
  const { setCircleData, setPageStatus } = useCircleContext()

  const handleCreateClick = useCallback(() => {
    setCircleData({
      ...initialCircleData,
      description: comment
    })
    setPageStatus(circlePageStatus.ADD_MANUALLY)
  }, [comment, setCircleData, setPageStatus])

  return (
    <button className="w-fit flex gap-x-2 items-center rounded-full px-3 py-4 bg-white cursor-pointer" onClick={handleCreateClick}>
      <Plus />
      <p className="text-sm font-bold leading-normal text-primary">
        Create new Circle
      </p>
    </button>
  )
}

export default CreateCircleItem
