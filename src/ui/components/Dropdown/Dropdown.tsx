import classNames from "classnames";
import Select, { Props as SelectProps } from "react-select";

import { SelectOption } from "@src/types";

import "./dropdown.scss";
import { IconOption } from "./IconOption";
import { IconSingleValue } from "./IconSingleValue";

export interface DropdownProps extends SelectProps<SelectOption> {
  id: string;
  label?: string;
  errorMessage?: string;
  options: readonly SelectOption[];
}

export const Dropdown = ({
  id,
  defaultValue,
  label,
  errorMessage,
  className,
  options,
  value,
  ...rest
}: DropdownProps): JSX.Element => (
  <div className={classNames("dropdown", className)}>
    {label && (
      <label className="dropdown__label" htmlFor={`input-${id}`}>
        {label}
      </label>
    )}

    <div className="dropdown__group">
      <Select
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

Dropdown.defaultProps = {
  label: "",
  errorMessage: "",
};
