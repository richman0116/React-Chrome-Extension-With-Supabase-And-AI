import { useCallback } from "react"
import Button from "../Buttons/Button"
import Plus from "../SVGIcons/Plus"
import { useCircleContext } from "../../context/CircleContext"
import { circlePageStatus } from "../../utils/constants"
import { BJActions } from "../../background/actions"
import { initialCircleData } from "../../context/CircleContext"

const CircleCreateButton = () => {
  const { setPageStatus, currentTabId, setCircleData } = useCircleContext()

  const handleAddGeneratedCircles = useCallback(() => {
    chrome.runtime.sendMessage(
      {
        action: BJActions.REMOVE_CIRCLES_FROM_STORAGE,
        tabId: currentTabId
      }
    )
    setPageStatus(circlePageStatus.ADD_AUTOMATICALLY)
  }, [currentTabId, setPageStatus])

  const handleAddManually = useCallback(() => {
    chrome.runtime.sendMessage(
      {
        action: BJActions.REMOVE_CIRCLES_FROM_STORAGE,
        tabId: currentTabId
      }
    )
    setCircleData(initialCircleData)
    setPageStatus(circlePageStatus.ADD_MANUALLY)
  }, [currentTabId, setCircleData, setPageStatus])

  return (
    <div className="relative inline-block group">
      <Button>
        <Plus />
      </Button>
      <div className="hidden group-hover:flex absolute left-1/2 -translate-x-1/2 -top-[85px] z-10 w-44 bg-white border border-stroke rounded-lg flex-col cursor-pointer divide-y divide-solid divide-stroke" >
        <button onClick={handleAddGeneratedCircles} className="w-full hover:bg-gray-100 p-2.5 text-black font-medium text-sm leading-normal">AI generated circles</button>
        <button onClick={handleAddManually} className="w-full hover:bg-gray-100 p-2.5 text-black font-medium text-sm leading-normal">Manually</button>
      </div>
    </div>
  )
}

export default CircleCreateButton
