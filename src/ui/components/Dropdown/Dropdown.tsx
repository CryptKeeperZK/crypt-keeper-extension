import classNames from "classnames";
import Select, { Props as SelectProps } from "react-select";

import { SelectOption } from "@src/types";

import { IconOption } from "./IconOption";
import { IconSingleValue } from "./IconSingleValue";
import "./dropdown.scss";

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
}: DropdownProps): JSX.Element => {
  return (
    <div className={classNames("dropdown", className)}>
      {label && (
        <label htmlFor={`input-${id}`} className="dropdown__label">
          {label}
        </label>
      )}

      <div className="dropdown__group">
        <Select
          classNamePrefix="dropdown"
          className="dropdown__container"
          closeMenuOnSelect={true}
          components={{ Option: IconOption, SingleValue: IconSingleValue }}
          defaultValue={defaultValue}
          inputId={`input-${id}`}
          id={id}
          options={options}
          placeholder="Choose"
          value={value}
          {...rest}
        />
      </div>

      {errorMessage && <div className="dropdown__error-message">{errorMessage}</div>}
    </div>
  );
};
