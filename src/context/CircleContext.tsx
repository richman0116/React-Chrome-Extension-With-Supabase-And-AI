import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { CircleInterface, ICircleGenerationStatus } from '../types/circle'
import { CircleGenerationStatus, circlePageStatus } from '../utils/constants'
import { BJActions } from '../background/actions'

interface ICircleContext {
  isCheckGenerationStatus: boolean
  commentData: string
  circles: CircleInterface[]
  currentUrl: string
  currentTabId: number
  currentTabTitle: string
  isLoading: boolean
  currentPageCircleIds: string[]
  circleData: CircleInterface,
  getCircles: () => void
  pageStatus: number
  setPageStatus: Dispatch<SetStateAction<number>>
  isLoadingCGenerationStatus: boolean
  circleGenerationStatus: ICircleGenerationStatus | null
  isGenesisPost: boolean
  setCircleGenerationStatus: Dispatch<SetStateAction<ICircleGenerationStatus | null>>
  getCircleGenerationStatus: () => void
  setCircleData: Dispatch<SetStateAction<CircleInterface>>
  setIsGenesisPost: Dispatch<SetStateAction<boolean>>
  setCommentData: Dispatch<SetStateAction<string>>
  setIsCheckGenerationStatus: Dispatch<SetStateAction<boolean>>
}

export const initialCircleData = {
  id: '',
  name: '',
  description: '',
  tags: [''],
  circle_logo_image: '',
}

const CircleContext = createContext<ICircleContext>({
  isCheckGenerationStatus: false,
  commentData: '',
  circles: [],
  currentUrl: '',
  currentTabId: NaN,
  currentTabTitle: '',
  isLoading: true,
  currentPageCircleIds: [],
  circleData: initialCircleData,
  getCircles: () => { },
  pageStatus: 0,
  isGenesisPost: false,
  setPageStatus: () => { },
  isLoadingCGenerationStatus: false,
  circleGenerationStatus: null,
  setCircleGenerationStatus: () => { },
  getCircleGenerationStatus: () => { },
  setCircleData: () => { },
  setIsGenesisPost: () => { },
  setCommentData: () => { },
  setIsCheckGenerationStatus: () => { }
})

export const useCircleContext = () => useContext(CircleContext)

interface ICircleContextProvider {
  children: React.ReactNode
}

export const CircleContextProvider = ({ children }: ICircleContextProvider) => {
  const [circles, setCircles] = useState<CircleInterface[]>([])
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [currentTabId, setCurrentTabId] = useState<number>(NaN)
  const [currentTabTitle, setCurrentTabTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pageStatus, setPageStatus] = useState(circlePageStatus.CIRCLE_LIST)
  const [circleGenerationStatus, setCircleGenerationStatus] = useState<ICircleGenerationStatus | null>(null)
  const [isLoadingCGenerationStatus, setIsLoadingCGenerationStatus] = useState(true)
  const [circleData, setCircleData] = useState(initialCircleData) // circle information for manual circle creation
  const [isGenesisPost, setIsGenesisPost] = useState(false)
  const [commentData, setCommentData] = useState<string>('')
  const [isCheckGenerationStatus, setIsCheckGenerationStatus] = useState<boolean>(false)

  const currentPageCircleIds = useMemo(
    () => circles.map((circle) => circle.id),
    [circles]
  )

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setCurrentUrl(tabs[0]?.url || '')
      setCurrentTabId(tabs[0].id || NaN)
      setCurrentTabTitle(tabs[0].title || '')
    })
  }, [])

  const getCircles = useCallback(async () => {
    if (currentUrl) {
      chrome.runtime.sendMessage(
        { action: BJActions.GET_CIRCLES, url: currentUrl },
        (response) => {
          if (response.error) {
            setCircles([])
            setIsLoading(false)
          } else {
            if (response.data) {
              setCircles(response.data)
              setIsLoading(false)
            } else {
              setCircles([])
              setIsLoading(false)
            }
          }
        }
      )
    }
  }, [currentUrl])

  const getCircleGenerationStatus = useCallback(() => {
    const getCircleGenerationStatusInterval: NodeJS.Timer = setInterval(() => {
      chrome.runtime.sendMessage(
        {
          action: BJActions.GET_CIRCLE_GENERATION_STATUS,
          tabId: currentTabId
        },
        (res) => {
          setIsLoadingCGenerationStatus(false)
          if (res) {
            const { type, result, status } = res
            if (Object.keys(res).length === 0 && !type) {
              // setPageStatus(circlePageStatus.CIRCLE_LIST)
              clearInterval(getCircleGenerationStatusInterval)
            }
            if (JSON.stringify(res) !== JSON.stringify(circleGenerationStatus)) {
              setCircleGenerationStatus(res)
            }
            if (type === "auto") {
              setPageStatus(circlePageStatus.ADD_AUTOMATICALLY)
              if (status !== CircleGenerationStatus.GENERATING) {
                clearInterval(getCircleGenerationStatusInterval)
              }
            } else if (type === "manual") {
              if (status === CircleGenerationStatus.INITIALIZED) {
                setPageStatus(circlePageStatus.ADD_MANUALLY);
              }
              if (result[0]?.circle_logo_image || status === CircleGenerationStatus.FAILED) {
                clearInterval(getCircleGenerationStatusInterval)
              }
              if (status === CircleGenerationStatus.GENERATING) {
                setPageStatus(circlePageStatus.ADD_MANUALLY)
              }
              if (status === CircleGenerationStatus.SUCCEEDED)
              {
                setPageStatus(circlePageStatus.CIRCLE_LIST)
                clearInterval(getCircleGenerationStatusInterval)      
              }
            } else if (type === "direct") {
              if (status === CircleGenerationStatus.INITIALIZED) {
                chrome.runtime.sendMessage(
                  { action: BJActions.GET_COMMENT_FROM_SOTRAGE }, (res) => {
                    if (res) {
                      setCommentData(res);
                    }
                  }               
                )
              }
              if (status === CircleGenerationStatus.GENERATING) {
                console.log('Circle is being generated...')
              }
              if (status === CircleGenerationStatus.SUCCEEDED) {
                clearInterval(getCircleGenerationStatusInterval)
              }
              if (status === CircleGenerationStatus.FAILED) {
                clearInterval(getCircleGenerationStatusInterval)
              }
            }
          } else {
            setPageStatus(circlePageStatus.CIRCLE_LIST)
            clearInterval(getCircleGenerationStatusInterval)
          }
        }
      )
    }, 1500)
  }, [circleGenerationStatus, currentTabId])

  useEffect(() => {
    getCircleGenerationStatus()

  }, [getCircleGenerationStatus])

  return (
    <CircleContext.Provider
      value={{
        isCheckGenerationStatus,
        commentData,
        circles,
        currentUrl,
        currentTabId,
        currentTabTitle,
        currentPageCircleIds,
        getCircles,
        circleData,
        isLoading,
        pageStatus,
        isGenesisPost,
        setPageStatus,
        isLoadingCGenerationStatus,
        circleGenerationStatus,
        setCircleGenerationStatus,
        getCircleGenerationStatus,
        setCircleData,
        setIsGenesisPost,
        setCommentData,
        setIsCheckGenerationStatus
      }}
    >
      {children}
    </CircleContext.Provider>
  )
}
