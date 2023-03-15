import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { components, OptionProps } from "react-select";

import type { SelectOption } from "@src/types";

export const IconOption = ({ data, ...rest }: OptionProps<SelectOption>): JSX.Element => (
  <components.Option {...rest} data={data}>
    {data.icon && <FontAwesomeIcon icon={data.icon} />}

    <span className={classNames("dropdown__value-label", data.icon && "ml-2")}>{data.label}</span>
  </components.Option>
);
