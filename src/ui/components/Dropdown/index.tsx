import React, { InputHTMLAttributes, ReactElement } from "react";
import "./dropdown.scss";
import classNames from "classnames";

type Props = {
  label?: string;
  errorMessage?: string;
  options: { value: string; label?: string }[];
} & InputHTMLAttributes<HTMLSelectElement>;

export default function Dropdown(props: Props): ReactElement {
  const { label, errorMessage, className, ...selectProps } = props;
  return (
    <div className={classNames("dropdown", className)}>
      {label && <div className="dropdown__label">{label}</div>}
      <div className="dropdown__group">
        <select className="dropdown__select" {...selectProps}>
          {props.options.map(({ value, label }) => (
            <option className="dropdown__option" key={value} value={value}>
              {label || value}
            </option>
          ))}
        </select>
      </div>
      {errorMessage && <div className="dropdown__error-message">{errorMessage}</div>}
    </div>
  );
}
