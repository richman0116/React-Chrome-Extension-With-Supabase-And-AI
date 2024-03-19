import { CircleInterface } from '../types/circle'
import { CircleGenerationStatus } from '../utils/constants'
import { getGeneratedCircles } from '../utils/edgeFunctions'
import { getSpecificNumberOfWords } from '../utils/helpers'

// function to get a value from storage
export const getFromStorage = (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError as string))
      } else {
        resolve(JSON.parse(result[key] || '{}'))
      }
    })
  })
}

export const setToStorage = (key: string, value: string) => {
  chrome.storage.local.set({ [key]: value }, function () {})
}

export const removeItemFromStorage = (key: string) => {
  chrome.storage.local.remove(key)
}

const circleGenerationSuccessHandler = (tabId: number, circles: CircleInterface[]) => {
  setToStorage(
    tabId.toString(),
    JSON.stringify({
      status: CircleGenerationStatus.SUCCEEDED,
      result: circles,
    })
  )
}
const circleGenerationFailedHandler = (tabId: number) => {
  setToStorage(
    tabId.toString(),
    JSON.stringify({
      status: CircleGenerationStatus.FAILED,
      result: [],
    })
  )
}
export const handleCircleGeneration = (
  tabId: number,
  pageUrl: string,
  pageContent: string
) => {
  getGeneratedCircles(pageUrl, pageContent)
    .then((res1: any) => {
      if (res1?.error && res1?.error === 'context_length_exceeded') {
        const limitedWords = getSpecificNumberOfWords(pageContent, 5000)
        getGeneratedCircles(pageUrl, limitedWords).then((res2) => {
          if (res2.length > 0) {
            circleGenerationSuccessHandler(tabId, res2)
          } else {
            circleGenerationFailedHandler(tabId)
          }
        })
      } else {
        if (res1.length > 0) {
          circleGenerationSuccessHandler(tabId, res1)
        } else {
          circleGenerationFailedHandler(tabId)
        }
      }
    })
    .catch((error) => {
      circleGenerationFailedHandler(tabId)
    })
}
