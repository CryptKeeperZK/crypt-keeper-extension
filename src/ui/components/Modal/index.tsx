import { MouseEventHandler, ReactNode, useCallback } from "react";
import ReactDOM from "react-dom";

import "./modal.scss";

let modalRoot: HTMLDivElement | null;

export interface ModalProps {
  className?: string;
  children: ReactNode | ReactNode[];
  onClose: MouseEventHandler;
}

export const Modal = ({ className, onClose, children, ...rest }: ModalProps): JSX.Element | null => {
  modalRoot = document.querySelector("#modal");

  const onClick: MouseEventHandler = useCallback((e) => e.stopPropagation(), []);

  return ReactDOM.createPortal(
    <div {...rest} className="modal__overlay" onClick={onClose}>
      <div className={`modal__wrapper ${className as string}`} onClick={onClick}>
        {children}
      </div>
    </div>,
    modalRoot as HTMLDivElement,
  );
};

Modal.defaultProps = {
  className: "",
};
