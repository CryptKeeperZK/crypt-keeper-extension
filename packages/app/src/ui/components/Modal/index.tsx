import Box from "@mui/material/Box";
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
    <Box {...rest} className="modal__overlay" role="none" onClick={onClose}>
      <Box className={`modal__wrapper ${className!}`} role="dialog" onClick={onClick}>
        {children}
      </Box>
    </Box>,
    modalRoot!,
  );
};

Modal.defaultProps = {
  className: "",
};
