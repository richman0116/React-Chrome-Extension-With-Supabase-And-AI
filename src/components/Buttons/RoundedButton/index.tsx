/* eslint-disable react/button-has-type */
import { forwardRef, HtmlHTMLAttributes } from 'react'

import classNames from 'classnames'

interface RoundedButtonProps extends HtmlHTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit'
  disabled?: boolean
}

const RoundedButton = forwardRef<HTMLButtonElement, RoundedButtonProps>(
  ({ type, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type || 'button'}
        disabled={disabled}
        {...props}
        className={classNames(
          'w-fit px-2.5 py-3 rounded-[20px] bg-branding hover:bg-green-800 text-brand hover:text-white text-xs font-bold leading-normal',
          {
            'cursor-not-allowed bg-brand/70': disabled,
          }
        )}
      />
    )
  }
)

export default RoundedButton
