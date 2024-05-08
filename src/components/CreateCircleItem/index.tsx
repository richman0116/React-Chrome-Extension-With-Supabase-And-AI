import { useCallback } from "react"

import { initialCircleData } from "../../context/CircleContext"
import { useCircleContext } from "../../context/CircleContext"
import Plus from "../SVGIcons/Plus"
import { circlePageStatus } from "../../utils/constants"

const CreateCircleItem = () => {
  const { setCircleData, setPageStatus, setIsGenesisPost } = useCircleContext()

  const handleCreateClick = useCallback(() => {
    setCircleData({
      ...initialCircleData,
    })
    setIsGenesisPost(true)
    setPageStatus(circlePageStatus.ADD_MANUALLY)
  }, [setCircleData, setIsGenesisPost, setPageStatus])

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
