import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { components, SingleValueProps } from "react-select";

import type { SelectOption } from "@src/types";
import classNames from "classnames";

export const IconSingleValue = (props: SingleValueProps<SelectOption>): JSX.Element => {
  return (
    <components.SingleValue {...props}>
      {props.data.icon && <FontAwesomeIcon icon={props.data.icon} />}

      <span className={classNames("dropdown__value-label", props.data.icon && "ml-2")}>{props.data.label}</span>
    </components.SingleValue>
  );
};
