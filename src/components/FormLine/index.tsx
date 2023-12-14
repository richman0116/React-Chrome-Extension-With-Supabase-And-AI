/* eslint-disable react/jsx-props-no-spreading */
import {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  InputHTMLAttributes,
  KeyboardEvent,
  MouseEvent,
} from "react";

import classNames from "classnames";

interface IFormLine extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  type?: string;
  title?: string;
  showStatus?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  value?: string;
  error?: string | boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onStatusClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

const FormLine: ForwardRefRenderFunction<HTMLInputElement, IFormLine> = (
  {
    id,
    type,
    title,
    showStatus,
    placeholder,
    value,
    error,
    required,
    disabled,
    onChange,
    onKeyDown,
    onStatusClick,
    ...restProps
  },
  ref
) => {
  return (
    <div className="relative mt-6 flex flex-col gap-y-1 ">
      <label
        title={title}
        htmlFor={id}
        className={classNames("text-sm font-semibold leading-4", {
          "text-red": error,
          "text-black/60": !error,
        })}
      >
        {title}
        {required && "*"}
      </label>
      <input
        {...restProps}
        id={id}
        className="rounded-lg bg-black/5 p-3 text-base font-medium leading-5 text-black/90 placeholder-black/40 outline-none autofill:bg-black/5"
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onKeyDown={onKeyDown}
        aria-label={title}
      />
      <span className="text-sm font-semibold leading-4 text-red">{error}</span>
    </div>
  );
};

export default forwardRef(FormLine);
