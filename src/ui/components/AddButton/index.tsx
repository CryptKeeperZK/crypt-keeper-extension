import { MouseEvent as ReactMouseEvent } from "react";
import { Icon } from "@src/ui/components/Icon";
import classNames from "classnames";

export interface AddButtonProps {
    title: string;
    action: (event: ReactMouseEvent) => void;
}

export const AddButton = ({ title, action }: AddButtonProps): JSX.Element => (
    <div className="flex flex-row items-center p-4">
        <button
            className={classNames(
                "flex flex-row items-center justify-center cursor-pointer text-gray-600",
                "add-button__active",
            )}
            data-testid="create-new-identity"
            type="button"
            onClick={action}
        >
            <Icon className="mr-2" fontAwesome="fas fa-plus" size={1} />

            <div>{title}</div>
        </button>
    </div>
)