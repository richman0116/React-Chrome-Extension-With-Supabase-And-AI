import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { BJActions } from '../background/actions'

interface AuthContextType {
  isAuthenticated: boolean
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>
  isChecking: boolean
  avatarUrl: string
  showLogoutBtn: boolean
  setShowLogoutBtn: Dispatch<SetStateAction<boolean>>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  isChecking: true,
  avatarUrl: '',
  showLogoutBtn: false,
  setShowLogoutBtn: () => { },
})

export const useAuthContext = () => useContext(AuthContext)

interface AuthContextProviderInterface {
  children: React.ReactNode
}

export const AuthContextProvider = ({ children }: AuthContextProviderInterface) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showLogoutBtn, setShowLogoutBtn] = useState(false)

  const checkIfLoggedIn = useCallback(() => {
    chrome.runtime.sendMessage({ action: BJActions.CHECK_LOGGED_IN }, (response) => {
      if (chrome.runtime.lastError) {
        setIsChecking(false)
        console.error(chrome.runtime.lastError)
      } else {
        if (response === true) {
          setIsAuthenticated(true)
          setIsChecking(false)
        } else {
          setIsAuthenticated(false)
          setIsChecking(false)
        }
      }
    })
  }, [])

  useEffect(() => {
    checkIfLoggedIn()
  }, [checkIfLoggedIn])

  useEffect(() => {
    const getAvatarUrl = () => {
      if (isAuthenticated) {
        chrome.runtime.sendMessage(
          {
            action: BJActions.GET_USER_AVATAR_URL,
          },
          (res) => {
            if (res && !res.error) {
              setAvatarUrl(res.avatar_url)
            } else {
              console.error('Failed to load avatar URL:', res?.error)
              setAvatarUrl('');
            }
          }
        )
      } else {
        setAvatarUrl('')
      }
    }

    getAvatarUrl()
  }, [isAuthenticated])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isChecking,
        avatarUrl,
        showLogoutBtn,
        setShowLogoutBtn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
