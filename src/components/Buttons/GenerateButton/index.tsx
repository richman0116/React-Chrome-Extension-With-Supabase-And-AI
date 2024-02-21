/* eslint-disable react/button-has-type */
import { forwardRef, HtmlHTMLAttributes } from 'react'

import classNames from 'classnames'

interface GenerateButtonProps extends HtmlHTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit'
  disabled?: boolean
}

const GenerateButton = forwardRef<HTMLButtonElement, GenerateButtonProps>(
  ({ type, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type || 'button'}
        disabled={disabled}
        {...props}
        className={classNames("w-fit px-3 py-2 rounded-full bg-secondary hover:bg-gray-200 text-primary text-xs font-bold leading-normal flex items-center gap-1", {
          'cursor-not-allowed bg-tertiary': disabled
        })}
      />
    )
  }
)

export default GenerateButton
