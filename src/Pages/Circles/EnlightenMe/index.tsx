import Button from "../../../components/Buttons/Button"
import CreationHeader from "../../../components/CreationHeader"
import ScreenIcon from "../../../components/SVGIcons/ScreenIcon"
import { useCircleContext } from "../../../context/CircleContext"
import { circlePageStatus } from "../../../utils/constants"

const EnlightenMe = () => {
  const { setPageStatus } = useCircleContext()
  return (
    <div className="w-full h-full relative">
      <CreationHeader
        title="Create Circle"
        onBack={() => {
          setPageStatus(circlePageStatus.CIRCLE_LIST)
        }}
      />
      <div className="w-full flex items-center justify-center py-8">
        <ScreenIcon />
      </div>
      <div className="w-full flex flex-col gap-2 text-sm font-medium leading-normal text-black">
        <p >Our AI model is able to analyze your recent browser history to generate some circles for you based on interest. Would you like us to do that?</p>
        <p>We strictly protects your privacy and no human will see your browsing history; your data will only be used by the AI model to generate circles for you.
        </p>
      </div>
      <div className="w-full flex flex-col gap-3 fixed left-1/2 -translate-x-1/2 bottom-8 justify-center items-center">
        <Button type="submit" >
          Permit and Create
        </Button>
        <button onClick={() => setPageStatus(circlePageStatus.CIRCLE_LIST)} className="text-sm font-bold leading-normal">Maybe next time</button>
      </div>
    </div >
  )
}

export default EnlightenMe
