import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { components, OptionProps } from "react-select";

import type { SelectOption } from "@src/types";

export const IconOption = (props: OptionProps<SelectOption>): JSX.Element => {
  return (
    <components.Option {...props}>
      {props.data.icon && <FontAwesomeIcon icon={props.data.icon} />}
      <span> </span>
      {props.data.label}
    </components.Option>
  );
};
