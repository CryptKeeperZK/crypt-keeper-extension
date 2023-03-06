import { components, OptionProps } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Option } from "@src/types";

export const IconOption = (props: OptionProps<Option>): JSX.Element => {
  const { Option } = components;

  return (
    <Option {...props}>
      {props.data.icon ? <FontAwesomeIcon icon={props.data.icon} /> : <></>}
      <span> </span>
      {props.data.label}
    </Option>
  );
};
