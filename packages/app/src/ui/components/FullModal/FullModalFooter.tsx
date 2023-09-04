import classNames from "classnames";
import { ReactNode } from "react";

import "./fullModal.scss";

export interface IFullModalFooterProps {
  className?: string;
  children: ReactNode;
}

export const FullModalFooter = ({ className = "", children }: IFullModalFooterProps): JSX.Element => (
  <div className={classNames("full-modal__footer", className)}>{children}</div>
);
