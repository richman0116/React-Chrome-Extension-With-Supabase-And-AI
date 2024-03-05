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
        className={classNames(
          'w-fit px-5 py-3 rounded-2xl bg-brand hover:bg-green-900 text-white text-base font-bold leading-normal',
          {
            'cursor-not-allowed bg-brand/70': disabled,
          }
        )}
      />
    )
  }
)

export default Button
