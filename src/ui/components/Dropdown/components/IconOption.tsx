import { InputHTMLAttributes, useEffect } from "react";
import { components } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Option } from "../index";

type Props = {
    label: string;
    icon: IconDefinition;
    options: readonly Option[];
} & InputHTMLAttributes<HTMLSelectElement>;

export const IconOption = (props: any) => {
    const { Option } = components;

    return (
        <Option {...props}>
            {props.data.icon ? (<FontAwesomeIcon icon={props.data.icon} />) : (<></>)}
            {props.data.label}
        </Option>
    );
}