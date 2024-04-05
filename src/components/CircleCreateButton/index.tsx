import { useCallback } from "react"
import Button from "../Buttons/Button"
import Plus from "../SVGIcons/Plus"
import { useCircleContext } from "../../context/CircleContext"
import { circlePageStatus } from "../../utils/constants"

const CircleCreateButton = () => {
  const { setPageStatus, showOptions, setShowOptions } = useCircleContext()

  const handleAddGeneratedCircles = useCallback(() => {
    setPageStatus(circlePageStatus.ADD_AUTOMATICALLY)
  }, [setPageStatus])

  const handleAddManually = useCallback(() => {
    setPageStatus(circlePageStatus.ADD_MANUALLY)
  }, [setPageStatus])

  return (
    <div className="relative inline-block">
      <Button onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setShowOptions((prev) => !prev)
      }}>
        <Plus />
      </Button>
      {showOptions && <div className="absolute left-1/2 -translate-x-1/2 -top-20 z-10 w-44 bg-white border border-stroke rounded-lg flex flex-col cursor-pointer divide-y divide-solid divide-stroke" >
        <button onClick={handleAddGeneratedCircles} className="w-full hover:bg-gray-100 p-2 text-black font-medium text-sm leading-normal">Add AI generated circles</button>
        <button onClick={handleAddManually} className="w-full hover:bg-gray-100 p-2 text-black font-medium text-sm leading-normal">Add Manually</button>
      </div>}
    </div>
  )
}

export default CircleCreateButton
