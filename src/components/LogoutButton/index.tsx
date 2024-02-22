import { useCallback } from "react"
import { useAuthContext } from "../../context/AuthContext";

const LogoutButton = () => {

  const { setIsAuthenticated } = useAuthContext()

  const handleLogOut = useCallback(() => {
    try {
      chrome.runtime.sendMessage(
        {
          action: "logout"
        },
        (response) => {
          if (response) {
            setIsAuthenticated(false)
          }
        }
      );
    } catch (err) {

    }
  }, [setIsAuthenticated])
  return (
    <button
      onClick={handleLogOut}
      className="p-4 text-alert text-base font-medium capitalize w-52 border border-stroke rounded-2xl flex bg-white hover:bg-gray-50"
    >
      Log out
    </button>
  )
}

export default LogoutButton
