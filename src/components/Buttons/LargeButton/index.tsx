/* eslint-disable react/button-has-type */
import { forwardRef, HtmlHTMLAttributes } from 'react'

import classNames from 'classnames'

interface LargeButtonProps extends HtmlHTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit'
  disabled?: boolean
}

const LargeButton = forwardRef<HTMLButtonElement, LargeButtonProps>(
  ({ type, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type || 'button'}
        disabled={disabled}
        {...props}
        className={classNames("w-full py-3.725 text-sm font-medium leading-normal text-center text-black/90 bg-secondary rounded-xl hover:bg-gray-200", {
          'cursor-not-allowed text-black/50': disabled
        })}
      />
    )
  }
)

export default LargeButton
