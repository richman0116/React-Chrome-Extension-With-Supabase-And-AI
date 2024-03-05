import { useEffect } from 'react'
import { useAuthContext } from '../../context/AuthContext'

const Avatar = () => {
  const { avatarUrl, setAvatarUrl } = useAuthContext()

  useEffect(() => {
    ;(() => {
      chrome.runtime.sendMessage(
        {
          action: 'getUserAvatarUrl',
        },
        (res) => {
          if (res) {
            setAvatarUrl(res.avatar_url)
          }
        }
      )
    })()
  }, [setAvatarUrl])

  return (
    <img
      src={avatarUrl || `../duck.jpg`}
      alt="user avatar"
      className="rounded-3xl min-w-5 h-5"
    />
  )
}

export default Avatar
