import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Header from '../../../components/Header'
import MyCircles from './MyCircles'
import { useCircleContext } from '../../../context/CircleContext'
import PageCirclList from './PageCirclesList'
import Avatar from '../../../components/Avatar'
import CircleCreateButton from '../../../components/CircleCreateButton'
import ShareThoughtBox from '../../../components/ShareThoughtBox'

const CircleList = () => {
  const [showAvatar, setShowAvatar] = useState(false)

  const { isLoading, circles, getCircles } = useCircleContext()

  const resultTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getCircles()
  }, [getCircles])

  const resultText = useMemo(() => {
    if (!isLoading) {
      if (circles.length > 1) {
        return `We found ${circles.length} Circles on this page!🎉`
      } else {
        return `${circles.length} Circle on this page`
      }
    }
  }, [circles, isLoading])

  const handleScroll = useCallback(() => {
    console.log(resultTextRef.current?.offsetTop)
      
    if (resultTextRef.current && resultTextRef.current?.offsetTop === 228) {
      resultTextRef.current?.classList.remove("border-b", "border-b-stroke")
      resultTextRef.current?.children?.item(1)?.classList.remove("font-medium", "capitalize", "text-lg", "justify-between")
      resultTextRef.current?.children?.item(1)?.classList.add("justify-center")
      setShowAvatar(false)
    } else {
      resultTextRef.current?.classList.add("border-b", "border-b-stroke")
      resultTextRef.current?.children?.item(0)?.classList.remove("justify-center")
      resultTextRef.current?.children?.item(0)?.classList.add("font-medium", "capitalize", "text-lg", "transition-all", "delay-300" ,"justify-between")
      setShowAvatar(true)
    }
  }, [])
  return (
    <div className="w-full h-140 flex flex-col items-center gap-5 overflow-y-auto overflow-x-hidden scrollbar-none pb-5" onScroll={handleScroll}>
      <div className="w-full px-5 pt-5">
        <Header />
      </div>
      <div className="w-full flex flex-col items-center gap-5 px-5">
        {/* <p className="text-3.5xl font-medium leading-normal capitalize text-primary">Any Thoughts About This Page?</p> */}
        <ShareThoughtBox />
        <div className='w-full flex items-center justify-center py-3 gap-2 sticky top-0 z-40 bg-white' ref={resultTextRef}>
          {!showAvatar && <div className='w-full border-b border-b-stroke'></div>}
          <div className="w-full flex justify-center items-center text-base leading-normal font-bold text-brand whitespace-nowrap">
            <p>{resultText}</p>
            {showAvatar && <Avatar />}
          </div>
          {!showAvatar && <div className='w-full border-b border-b-stroke'></div>}
        </div>
        <PageCirclList />
        <MyCircles />
        <div className="fixed bottom-6 w-fit justify-center">
          <CircleCreateButton />
        </div>
      </div>
    </div>
  )
}

export default CircleList
