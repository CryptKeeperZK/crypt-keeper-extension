import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { components, OptionProps } from "react-select";

import type { SelectOption } from "@src/types";
import classNames from "classnames";

export const IconOption = (props: OptionProps<SelectOption>): JSX.Element => {
  return (
    <components.Option {...props}>
      {props.data.icon && <FontAwesomeIcon icon={props.data.icon} />}

      <span className={classNames("dropdown__value-label", props.data.icon && "ml-2")}>{props.data.label}</span>
    </components.Option>
  );
};
