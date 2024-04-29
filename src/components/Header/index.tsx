import { useCallback, useEffect, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import CircleIcon from '../SVGIcons/CircleIcon'
import UserIcon from '../SVGIcons/UserIcon'
import Avatar from '../Avatar'
import LogoutButton from '../LogoutButton'
import { BJActions } from '../../background/actions'
import EnlightenIcon from '../SVGIcons/EnlightenIcon'
import { useCircleContext } from '../../context/CircleContext'
import { circlePageStatus } from '../../utils/constants'

const Header = () => {
  const { isAuthenticated, showLogoutBtn, setShowLogoutBtn } = useAuthContext()
  const { setPageStatus } = useCircleContext()
  const [usersCount, setUsersCount] = useState(0)
  const [circlesCount, setCirclesCount] = useState(0)

  useEffect(() => {
    (() => {
      chrome.runtime.sendMessage(
        {
          action: BJActions.GET_UNIQUE_USERS_COUNT_IN_USER_CIRCLES,
        },
        (res: any) => {
          if (!res.error) {
            setUsersCount(res)
          }
        }
      )
    })()
  }, [])

  useEffect(() => {
    (() => {
      chrome.runtime.sendMessage(
        {
          action: BJActions.GET_USER_CIRCLE_COUNT,
        },
        (res: any) => {
          if (!res.error) {
            setCirclesCount(res)
          }
        }
      )
    })()
  }, [])

  const handleAvatarClick = useCallback(() => {
    setShowLogoutBtn(!showLogoutBtn)
  }, [setShowLogoutBtn, showLogoutBtn])

  const handleEnlightenMeClick = useCallback(() => {
    setPageStatus(circlePageStatus.ENLIGHTEN_ME)
  }, [setPageStatus])

  return (
    <div className="w-full flex justify-between items-center relative">
      <p className="text-xl font-extrabold leading-normal text-brand">Eden</p>
      {isAuthenticated ? (
        <div className="w-full flex gap-2 items-center flex-row-reverse">
          <div
            className="px-3 py-2 bg-secondary flex items-center gap-2 rounded-3xl text-primary cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleAvatarClick()
            }}
          >
            <div className="flex gap-1 items-center justify-between">
              <CircleIcon width='12' height='12' viewBox='0 0 12 12' color='#424547' />
              <p className="text-xs font-medium">{circlesCount}</p>
            </div>
            <div className="flex gap-1 items-center justify-between">
              <UserIcon />
              <p className="text-xs font-medium">{usersCount}</p>
            </div>
            <Avatar />
          </div>
          <div
            className="px-3 py-2 bg-secondary flex items-center gap-1 rounded-3xl text-primary cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleEnlightenMeClick()
            }}
          >
            <EnlightenIcon />
            <p className="text-xs font-bold leading-normal">Enlighten Me</p>
          </div>
        </div>
      ) : null}
      {showLogoutBtn ? (
        <div className="absolute top-full right-0 z-50">
          <LogoutButton />
        </div>
      ) : null}
    </div>
  )
}

export default Header
