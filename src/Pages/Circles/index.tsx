import { circlePageStatus } from '../../utils/constants'
import CircleList from './CircleList'
import { useCircleContext } from '../../context/CircleContext'
import AddCircle from './AddCircle'
import Loading from '../../components/Loading'

const Circles = () => {
  const { pageStatus, isLoadingCGenerationStatus } = useCircleContext()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {isLoadingCGenerationStatus ? (
        <div className="absolute left-1/2 -translate-x-1/2 transform self-center border-black py-4">
          <Loading />
        </div>
      ) : (
        pageStatus === circlePageStatus.CIRCLE_LIST ? <CircleList /> : <AddCircle />
      )}
    </div>
  )
}

export default Circles
