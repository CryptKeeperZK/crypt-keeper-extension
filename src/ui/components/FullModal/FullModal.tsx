import classNames from "classnames";
import { ReactNode } from "react";

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
