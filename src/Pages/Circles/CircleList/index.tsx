import { useCallback, useMemo } from 'react'

import Header from '../../../components/Header'
import MyCircles from './MyCircles'
import { useCircleContext } from '../../../context/CircleContext'
import PageCirclList from './PageCirclesList'
import Button from '../../../components/Buttons/Button'
import { circlePageStatus } from '../../../utils/constants'
import Plus from '../../../components/SVGIcons/Plus'

const CircleList = () => {
  const { isLoading, circles, setPageStatus } = useCircleContext()

  const resultText = useMemo(() => {
    if (!isLoading) {
      if (circles.length > 1) {
        return `${circles.length} circles on this page`
      } else {
        return `${circles.length} circle on this page`
      }
    }
  }, [circles, isLoading])

  const handlePlusClick = useCallback(() => {
    setPageStatus(circlePageStatus.ADD_AUTOMATICALLY)
  }, [setPageStatus])

  return (
    <div className="w-full h-full flex flex-col items-center gap-5 overflow-y-auto overflow-x-hidden scrollbar-none">
      <Header />
      <div className="w-full sticky top-0 bg-white py-3 z-40">
        <p className=" text-3.5xl font-medium capitalize text-primary">{resultText}</p>
      </div>
      <PageCirclList />
      <MyCircles />
      <div className="fixed bottom-6 w-fit justify-center">
        <Button onClick={handlePlusClick}>
          <Plus />
        </Button>
      </div>
    </div>
  )
}

export default CircleList
