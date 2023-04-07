import classNames from "classnames";
import { ReactNode } from "react";

import "./fullModal.scss";

export interface FullModalContentProps {
  className?: string;
  children: ReactNode;
}

export const FullModalContent = ({ className = "", children }: FullModalContentProps): JSX.Element => (
  <div className={classNames("full-modal__content", className)}>{children}</div>
);
