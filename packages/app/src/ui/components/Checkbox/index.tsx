import classNames from "classnames";
import { ChangeEventHandler, Ref, forwardRef } from "react";

import { Icon } from "@src/ui/components/Icon";

import "./checkbox.scss";

export interface CheckboxProps {
  checked: boolean;
  id: string;
  className?: string;
  disabled?: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const CheckboxUI = (
  { id, className = "", disabled = false, checked, onChange }: CheckboxProps,
  ref: Ref<HTMLInputElement>,
): JSX.Element => (
  <div
    className={classNames("checkbox", className, {
      "checkbox--checked": checked,
    })}
  >
    <input ref={ref} checked={checked} disabled={disabled} id={id} type="checkbox" onChange={onChange} />

    <Icon fontAwesome="fa-check" />
  </div>
);

export const Checkbox = forwardRef(CheckboxUI);
