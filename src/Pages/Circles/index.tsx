import { circlePageStatus } from '../../utils/constants'
import CircleList from './CircleList'
import { useCircleContext } from '../../context/CircleContext'
import AddCircle from './AddCircle'

const Circles = () => {
  const { pageStatus } = useCircleContext()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {pageStatus === circlePageStatus.CIRCLE_LIST ? <CircleList /> : <AddCircle />}
    </div>
  )
}

export default Circles
