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
    <div className="relative flex flex-col gap-y-1 group">
      <label
        title={title}
        htmlFor={id}
        className={classNames("text-sm transition-all duration-300 font-bold leading-4 group-focus-within:font-extrabold", {
          "text-red": error,
          "text-black/60 group-focus-within:text-black/70": !error,
        })}
      >
        {title}
      </label>
      <input
        {...restProps}
        id={id}
        className="rounded-2xl bg-secondary transition-colors duration-300 border border-secondary group-focus-within:border-gray-500 px-3 pb-2 pt-3 text-base font-medium leading-5 text-primary placeholder-fourth outline-none autofill:bg-secondary"
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
