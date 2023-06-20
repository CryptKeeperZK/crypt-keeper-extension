import classNames from "classnames";
import { forwardRef, Ref } from "react";
import Select, { Props as SelectProps, SelectInstance } from "react-select";

import { SelectOption } from "@src/types";

import "./dropdown.scss";
import { IconOption } from "./IconOption";
import { IconSingleValue } from "./IconSingleValue";

export interface DropdownProps extends SelectProps<SelectOption> {
  id: string;
  label: string;
  errorMessage?: string;
  options: readonly SelectOption[];
}

const DropdownUI = (
  { id, defaultValue, label, errorMessage = "", className, options, value, ...rest }: DropdownProps,
  ref: Ref<SelectInstance<SelectOption, boolean>>,
): JSX.Element => (
  <div className={classNames("dropdown", className)}>
    {label && (
      <label className="dropdown__label" htmlFor={`input-${id}`}>
        {label}
      </label>
    )}

    <div className="dropdown__group">
      <Select
        ref={ref}
        closeMenuOnSelect
        className="dropdown__container"
        classNamePrefix="dropdown"
        components={{ Option: IconOption, SingleValue: IconSingleValue }}
        defaultValue={defaultValue}
        id={id}
        inputId={`input-${id}`}
        options={options}
        placeholder="Choose"
        value={value}
        {...rest}
      />
    </div>

    {errorMessage && <div className="dropdown__error-message">{errorMessage}</div>}
  </div>
);

export const Dropdown = forwardRef<SelectInstance<SelectOption, boolean>, DropdownProps>(DropdownUI);
