import CircleList from './CircleList'
import AddCircle from './AddCircle'
import EnlightenMe from './EnlightenMe'
import LoadingPage from '../../components/LoadingPage'

import { useCircleContext } from '../../context/CircleContext'
import { circlePageStatus } from '../../utils/constants'

const Circles = () => {
  const { pageStatus, isLoadingCGenerationStatus } = useCircleContext()
  return (
    isLoadingCGenerationStatus ? (
      <div className="w-full h-140 flex flex-col items-center justify-center">
        <div className="absolute left-1/2 -translate-x-1/2 transform self-center border-black py-4">
          <LoadingPage />
        </div>
      </div>
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center">
        {pageStatus === circlePageStatus.CIRCLE_LIST && <CircleList />}
        {(pageStatus === circlePageStatus.ADD_AUTOMATICALLY || pageStatus === circlePageStatus.ADD_MANUALLY) && <AddCircle />}
        {pageStatus === circlePageStatus.ENLIGHTEN_ME && <EnlightenMe />}
      </div>
    )
  )
}

export default Circles
