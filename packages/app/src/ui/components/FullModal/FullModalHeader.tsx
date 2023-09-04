import classNames from "classnames";
import { ReactNode } from "react";

import { Icon } from "@src/ui/components/Icon";

import "./fullModal.scss";

export interface IFullModalHeaderProps {
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export const FullModalHeader = ({
  children,
  className = "",
  onClose = undefined,
}: IFullModalHeaderProps): JSX.Element => (
  <div className={classNames("full-modal__header", className)}>
    <div className="text-xl flex-grow flex-shrink full-modal__header__content">{children}</div>

    <div className="flex-grow-0 flex-shrink-0 full-modal__header__action">
      {onClose && <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.25} onClick={onClose} />}
    </div>
  </div>
);
