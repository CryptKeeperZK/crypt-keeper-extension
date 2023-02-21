import React, { InputHTMLAttributes, ReactElement } from "react";
import classNames from "classnames";
import "./dropdown.scss";

type Props = {
  label?: string;
  errorMessage?: string;
  options: { value: string; label?: string }[];
} & InputHTMLAttributes<HTMLSelectElement>;

export default function Dropdown(props: Props): ReactElement {
  const { label, errorMessage, ...selectProps } = props;
  return (
    <div className={classNames("dropdown")}>
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
