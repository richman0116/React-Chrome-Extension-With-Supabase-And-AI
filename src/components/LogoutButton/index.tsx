import { Dispatch, SetStateAction, useCallback } from "react"

interface LogoutButtonInterface {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>
}

const LogoutButton = ({ setIsLoggedIn }: LogoutButtonInterface) => {
  const handleLogOut = useCallback(() => {
    try {
      chrome.runtime.sendMessage(
        {
          action: "logout"
        },
        (response) => {
          if (response) {
            setIsLoggedIn(false)
          }
        }
      );
    } catch (err) {

    }
  }, [setIsLoggedIn])
  return (
    <button
      onClick={handleLogOut}
      className="bg-red-500 text-white px-3 py-2.5 rounded-md text-sm font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
    >
      Log out
    </button>
  )
}

export default LogoutButton
