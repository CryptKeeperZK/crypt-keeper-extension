import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { components, SingleValueProps } from "react-select";

import type { SelectOption } from "@src/types";

export const IconSingleValue = ({ data, ...rest }: SingleValueProps<SelectOption>): JSX.Element => (
  <components.SingleValue {...rest} data={data}>
    {data.icon && <FontAwesomeIcon icon={data.icon} />}

    <span className={classNames("dropdown__value-label", data.icon && "ml-2")}>{data.label}</span>
  </components.SingleValue>
);
