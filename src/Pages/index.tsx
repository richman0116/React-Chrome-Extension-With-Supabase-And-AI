import Circles from './Circles'
import Login from './Login'
import LoadingPage from '../components/LoadingPage'
import { useAuthContext } from '../context/AuthContext'
import { useCircleContext } from '../context/CircleContext'

const Main = () => {
  const { isAuthenticated, isChecking, setShowLogoutBtn } = useAuthContext()
  const { setShowOptions } = useCircleContext()

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      onClick={() => {
        setShowLogoutBtn(false)
        setShowOptions(false)
      }}
    >
      {isChecking ? (
        <div className="w-full h-140 flex flex-col items-center justify-center">
          <div className="absolute left-1/2 -translate-x-1/2 transform self-center border-black py-4">
            <LoadingPage />
          </div>
        </div>
      ) : (
        <>{isAuthenticated ? <Circles /> : <Login />}</>
      )}
    </div>
  )
}

export default Main
