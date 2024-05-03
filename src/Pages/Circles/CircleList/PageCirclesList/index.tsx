import { useEffect } from 'react'

import CircleItem from '../../../../components/CircleItem'
import LoadingPage from '../../../../components/LoadingPage'

import classNames from 'classnames'
import { useCircleContext } from '../../../../context/CircleContext'
import { BJActions } from '../../../../background/actions'

const PageCircleList = () => {
  const { circles, isLoading, currentUrl: url } = useCircleContext()
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url
      chrome.runtime.sendMessage({ action: BJActions.SHOW_CIRCLE_COUNT, url }, (response) => {
        console.log('circle badge number has been updated')
      })
    })
  }, [])

  return (
    <div
      className={classNames('w-full', {
        hidden: circles.length === 0,
      })}
    >
      <div className="w-full flex flex-col gap-2">
        <div className="w-full">
          {!isLoading && <p className="text-xl font-medium text-primary pb-1">Existing Circles on this page</p>}
        </div>
        {isLoading && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center nborder-gray-600 py-4 ">
            <LoadingPage />
          </div>
        )}

        {!isLoading && circles.length > 0 && (
          <div className="w-full flex flex-col gap-y-2">
            {circles.map((circle, index) => (
              <CircleItem key={index} circle={circle} url={url} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageCircleList
