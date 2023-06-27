import { RequestResolutionStatus } from "../request";

export interface RequestResolutionAction<D = unknown> {
  id: string;
  status: RequestResolutionStatus;
  data?: D;
}

export interface MessageAction<P = unknown, M = unknown> {
  method: string;
  payload?: P;
  error?: boolean;
  meta?: M;
}

export interface ReduxAction<P = unknown, M = unknown> {
  type: string;
  payload?: P;
  error?: boolean;
  meta?: M;
}

export type * from "./identities";
export type * from "./permissions";
