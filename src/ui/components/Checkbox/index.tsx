import classNames from "classnames";
import { ChangeEventHandler } from "react";

import { Icon } from "@src/ui/components/Icon";

import "./index.scss";

export interface CheckboxProps {
  checked: boolean;
  id: string;
  className: string;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export const Checkbox = ({ id, className, disabled = false, checked, onChange }: CheckboxProps): JSX.Element => (
  <div
    className={classNames("checkbox", className, {
      "checkbox--checked": checked,
    })}
  >
    <input checked={checked} disabled={disabled} id={id} type="checkbox" onChange={onChange} />

    <Icon fontAwesome="fa-check" />
  </div>
);
