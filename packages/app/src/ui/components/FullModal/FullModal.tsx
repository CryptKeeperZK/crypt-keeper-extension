import classNames from "classnames";
import { ReactNode } from "react";

import { Modal } from "@src/ui/components/Modal";

import "./fullModal.scss";

export interface IFullModalProps {
  children: ReactNode;
  className?: string;
  onClose: () => void;
}

export const FullModal = ({ children, className = "", onClose, ...rest }: IFullModalProps): JSX.Element => (
  <Modal {...rest} className={classNames("full-modal", className)} onClose={onClose}>
    {children}
  </Modal>
);
