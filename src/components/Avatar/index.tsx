import { useAuthContext } from '../../context/AuthContext'

const Avatar = () => {
  const { avatarUrl } = useAuthContext()

  return (
    <img
      src={avatarUrl || `../duck.jpg`}
      alt="user avatar"
      className="rounded-3xl min-w-5 h-5"
    />
  )
}

export default Avatar
