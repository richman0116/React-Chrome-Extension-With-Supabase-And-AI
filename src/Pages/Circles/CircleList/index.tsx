import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Header from '../../../components/Header'
import MyCircles from './MyCircles'
import { useCircleContext } from '../../../context/CircleContext'
import PageCirclList from './PageCirclesList'
import Button from '../../../components/Buttons/Button'
import { circlePageStatus } from '../../../utils/constants'
import Plus from '../../../components/SVGIcons/Plus'
import Avatar from '../../../components/Avatar'

const CircleList = () => {
  const [showAvatar, setShowAvatar] = useState(false)

  const { isLoading, circles, getCircles, setPageStatus } = useCircleContext()

  const resultTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCircles()
  }, [getCircles])

  const resultText = useMemo(() => {
    if (!isLoading) {
      if (circles.length > 1) {
        return `${circles.length} circles on this page 🎉`
      } else {
        return `${circles.length} circle on this page`
      }
    }
  }, [circles, isLoading])

  const handlePlusClick = useCallback(() => {
    setPageStatus(circlePageStatus.ADD_AUTOMATICALLY)
  }, [setPageStatus])

  const handleScroll = useCallback(() => {
    if (resultTextRef.current && resultTextRef.current?.offsetTop > 100) {
      resultTextRef.current.classList.add("font-medium", "capitalize", "text-xl", "border-b", "border-b-stroke", "transition-all", "delay-300")
      setShowAvatar(true)
    } else {
      resultTextRef?.current?.classList.remove("font-medium", "capitalize", "text-xl", "border-b", "border-b-stroke")
      setShowAvatar(false)
    }
  }, [])
  return (
    <div className="w-full h-140 flex flex-col items-center gap-5 overflow-y-auto overflow-x-hidden scrollbar-none pb-5" onScroll={handleScroll}>
      <div className="w-full px-5 pt-5">
        <Header />
      </div>
      <div className="w-full flex justify-between items-center sticky top-0 bg-white py-3 z-40 text-base leading-normal font-bold text-brand px-5" ref={resultTextRef}>
        <p>{resultText}</p>
        {showAvatar && <Avatar />}
      </div>
      <p className="text-3.5xl font-medium leading-normal capitalize text-primary px-5">Any Thoughts About This Page?</p>
      <PageCirclList />
      <MyCircles />
      <div className="fixed bottom-6 w-fit justify-center px-5">
        <Button onClick={handlePlusClick}>
          <Plus />
        </Button>
      </div>
    </div>
  )
}

export default CircleList
