import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import FormLine from '../../components/FormLine'
import LargeButton from '../../components/Buttons/LargeButton'
import Header from '../../components/Header'
// import ArrowBack from "../../components/ArrowBack.tsx";
import { Paths } from '../../utils/constants'
import GoogleIcon from '../../components/SVGIcons/GoogleIcon'
import { useAuthContext } from '../../context/AuthContext'
import { BJActions } from '../../background/actions'

interface LoginFormData {
  email: string
  password: string
}

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const { setIsAuthenticated } = useAuthContext()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({})

  const handleSignIn = useCallback(
    (data: LoginFormData) => {
      try {
        setIsSubmitting(true)
        const { email, password } = data
        chrome.runtime.sendMessage(
          {
            action: BJActions.LOGIN_WITH_EMAIL_PASSWORD,
            email,
            password,
          },
          (response) => {
            if (response.error) {
              console.log('response.error', response.error)
              setErrorMsg(response.error)
              setIsSubmitting(false)
            } else {
              console.log('response', response)
              if (response) {
                // Kazuo: please have some notification system
                // so that when the password is wrong or anything
                // that make the response false, show a warning
                setErrorMsg('')
                setIsSubmitting(false)
                setIsAuthenticated(true)
              } else {
                // something is wrong that made the response falses
                setErrorMsg('Invalid login credentials')
                setIsSubmitting(false)
              }
            }
          }
        )
      } catch (ex) {
        console.log(ex, 'kkkkkkkk')
      }
    },
    [setIsAuthenticated]
  )

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col gap-5 w-full">
        <Header />
        <h2 className="text-3.5xl font-medium capitalize text-primary leading-normal">
          Browse, Explore, Connect.
        </h2>
        <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
          <FormLine
            title="Email"
            id="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Entered value does not match email format"
              }
            })}
            placeholder="Your email address"
          />
          <FormLine
            title="Password"
            id="password"
            type="password"
            error={errors.password?.message}
            {...register('password', {
              required: true
            })}
            placeholder="Your password"
          />
          <p className="text-base text-alert">{errorMsg}</p>
          <div className="flex flex-col gap-2">
            <div className="w-full flex items-center justify-center">
              <LargeButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Login'}
              </LargeButton>
            </div>
            <LargeButton>
              <div className="w-full flex justify-center items-center gap-2">
                <GoogleIcon />
                <p>Log in with Google</p>
              </div>
            </LargeButton>
            <div className="w-full">
              <a
                href={Paths.SIGNUP}
                target="_blank"
                rel="noreferrer"
                className="text-base text-blue-500 hover:text-blue-800"
              >
                <LargeButton>Sign Up</LargeButton>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
