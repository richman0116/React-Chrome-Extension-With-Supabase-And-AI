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
          'w-fit px-3 py-2 rounded-[20px] bg-brand hover:bg-green-900 text-white text-xs font-bold leading-normal',
          {
            'cursor-not-allowed bg-brand/70': disabled,
          }
        )}
      />
    )
  }
)

export default RoundedButton
