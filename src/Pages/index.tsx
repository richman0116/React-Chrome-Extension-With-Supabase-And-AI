import Circles from './Circles'
import Login from './Login'
import Loading from '../components/Loading'
import { useAuthContext } from '../context/AuthContext'

const Main = () => {
  const { isAuthenticated, isChecking, setShowLogoutBtn } = useAuthContext()

  return (
    <div
      className="w-full h-full p-5 flex flex-col items-center justify-center"
      onClick={() => setShowLogoutBtn(false)}
    >
      {isChecking ? (
        <div className="absolute left-1/2 -translate-x-1/2 transform self-center border-black py-4">
          <Loading />
        </div>
      ) : (
        <>{isAuthenticated ? <Circles /> : <Login />}</>
      )}
    </div>
  )
}

export default Main
