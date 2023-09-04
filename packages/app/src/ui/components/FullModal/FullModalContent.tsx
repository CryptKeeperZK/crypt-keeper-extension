import classNames from "classnames";
import { ReactNode } from "react";

import "./fullModal.scss";

export interface IFullModalContentProps {
  className?: string;
  children: ReactNode;
}

export const FullModalContent = ({ className = "", children }: IFullModalContentProps): JSX.Element => (
  <div className={classNames("full-modal__content", className)}>{children}</div>
);
