/* eslint-disable react/button-has-type */
import { forwardRef, HtmlHTMLAttributes } from 'react'

import classNames from 'classnames'

interface ButtonProps extends HtmlHTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit'
  disabled?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type || 'button'}
        disabled={disabled}
        {...props}
        className={classNames("w-full py-2.5 text-base capitalize font-semibold rounded-md bg-gray-700 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50", {
          'bg-gray-500 hover:bg-gray-600 active:bg-gray-700 focus:ring-gray-500 cursor-not-allowed': disabled
        })}
      />
    )
  }
)

Button.displayName = 'Button'
export { Button }
