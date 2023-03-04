import React, { InputHTMLAttributes, ReactElement } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select, { GroupBase, Options, OptionsOrGroups } from "react-select";
import {
  IconLookup,
  IconDefinition,
  findIconDefinition
} from '@fortawesome/fontawesome-svg-core'
import { fas, faCoffee } from '@fortawesome/free-solid-svg-icons';
import "./dropdown.scss";
import classNames from "classnames";
import Icon from "../Icon";

export type Option = {
  readonly value: string;
  readonly label: string;
}

type Props = {
  label?: string;
  errorMessage?: string;
  options: readonly Option[];
} & InputHTMLAttributes<HTMLSelectElement>;

export default function Dropdown(props: Props): ReactElement {
  const { label, errorMessage, className, ...selectProps } = props;
  return (
    <div className={classNames("dropdown", className)}>
      {label && <div className="dropdown__label">{label}</div>}
      <div className="dropdown__group">
        <Select
          classNamePrefix="dropdown"
          closeMenuOnSelect={true}
          placeholder={"Choose"}
          options={props.options}
        />
        {/* <select className="dropdown__select" {...selectProps}>
          {props.options.map(({ value, label }) => (
            <option className="dropdown__option" key={value}>
              <Icon fontAwesome="fas fa-tools" size={1.5} className="text-gray-700" /> {label || value}
            </option>
          ))}
        </select> */}
      </div>
      {errorMessage && <div className="dropdown__error-message">{errorMessage}</div>}
    </div>
  );
}
