import classNames from "classnames";
import { ReactNode } from "react";

import { Icon } from "@src/ui/components/Icon";
import { Modal } from "@src/ui/components/Modal";

import "./full-modal.scss";

export interface FullModalProps {
  children: ReactNode;
  className?: string;
  onClose: () => void;
}

export const FullModal = ({ children, className, onClose, ...rest }: FullModalProps): JSX.Element => (
  <Modal {...rest} className={classNames("full-modal", className)} onClose={onClose}>
    {children}
  </Modal>
);

FullModal.defaultProps = {
  className: "",
};

export interface FullModalHeaderProps {
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export const FullModalHeader = ({ className, children, onClose }: FullModalHeaderProps): JSX.Element => (
  <div className={classNames("full-modal__header", className)}>
    <div className="text-xl flex-grow flex-shrink full-modal__header__content">{children}</div>

    <div className="flex-grow-0 flex-shrink-0 full-modal__header__action">
      {onClose && <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.25} onClick={onClose} />}
    </div>
  </div>
);

FullModalHeader.defaultProps = {
  className: "",
  onClose: undefined,
};

export interface FullModalContentProps {
  className?: string;
  children: ReactNode;
}

export const FullModalContent = ({ className, children }: FullModalContentProps): JSX.Element => (
  <div className={classNames("full-modal__content", className)}>{children}</div>
);

FullModalContent.defaultProps = {
  className: "",
};

export interface FullModalFooterProps {
  className?: string;
  children: ReactNode;
}

export const FullModalFooter = ({ className, children }: FullModalFooterProps): JSX.Element => (
  <div className={classNames("full-modal__footer", className)}>{children}</div>
);

FullModalFooter.defaultProps = {
  className: "",
};
