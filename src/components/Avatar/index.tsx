import { useEffect } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import { BJActions } from '../../background/actions'

const Avatar = () => {
  const { avatarUrl, setAvatarUrl } = useAuthContext()

  useEffect(() => {
    (() => {
      chrome.runtime.sendMessage(
        {
          action: BJActions.GET_USER_AVATAR_URL,
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
