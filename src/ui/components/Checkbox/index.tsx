import classNames from "classnames";
import { ChangeEventHandler } from "react";

import { Icon } from "@src/ui/components/Icon";

import "./index.scss";

export interface CheckboxProps {
  checked: boolean;
  className?: string;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export const Checkbox = ({ className, checked, onChange, disabled }: CheckboxProps): JSX.Element => (
  <div
    className={classNames("checkbox", className, {
      "checkbox--checked": checked,
    })}
  >
    <input checked={checked} disabled={disabled} type="checkbox" onChange={onChange} />

    <Icon fontAwesome="fa-check" />
  </div>
);

Checkbox.defaultProps = {
  className: "",
  disabled: false,
};
