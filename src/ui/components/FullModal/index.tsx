import React, { ReactElement, ReactNode } from "react";
import Modal from "@src/ui/components/Modal";
import classNames from "classnames";
import "./full-modal.scss";
import Icon from "@src/ui/components/Icon";

type Props = {
  onClose: () => void;
  className?: string;
  children: ReactNode;
};
export default function FullModal({ children, className, onClose, ...rest }: Props): ReactElement {
  return (
    <Modal {...rest} className={classNames("full-modal", className)} onClose={onClose}>
      {children}
    </Modal>
  );
}

export function FullModalHeader(props: {
  className?: string;
  children: ReactNode;
  onClose?: () => void;
}): ReactElement {
  return (
    <div className={classNames("full-modal__header", props.className)}>
      <div className="text-xl flex-grow flex-shrink full-modal__header__content">{props.children}</div>
      <div className="flex-grow-0 flex-shrink-0 full-modal__header__action">
        {props.onClose && (
          <Icon data-testid="close-icon" fontAwesome="fas fa-times" size={1.25} onClick={props.onClose} />
        )}
      </div>
    </div>
  );
}

export function FullModalContent(props: { className?: string; children: ReactNode }): ReactElement {
  return <div className={classNames("full-modal__content", props.className)}>{props.children}</div>;
}

export function FullModalFooter(props: { className?: string; children: ReactNode }): ReactElement {
  return <div className={classNames("full-modal__footer", props.className)}>{props.children}</div>;
}
