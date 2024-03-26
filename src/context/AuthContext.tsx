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
  setAvatarUrl: Dispatch<SetStateAction<string>>
  showLogoutBtn: boolean
  setShowLogoutBtn: Dispatch<SetStateAction<boolean>>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => { },
  isChecking: true,
  avatarUrl: '',
  setAvatarUrl: () => { },
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isChecking,
        avatarUrl,
        setAvatarUrl,
        showLogoutBtn,
        setShowLogoutBtn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
