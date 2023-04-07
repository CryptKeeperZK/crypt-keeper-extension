import classNames from "classnames";
import { ReactNode } from "react";

import "./fullModal.scss";

export interface FullModalFooterProps {
  className?: string;
  children: ReactNode;
}

export const FullModalFooter = ({ className = "", children }: FullModalFooterProps): JSX.Element => (
  <div className={classNames("full-modal__footer", className)}>{children}</div>
);
