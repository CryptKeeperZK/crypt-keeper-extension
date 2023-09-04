import { RequestResolutionStatus } from "../request";

export interface IRequestResolutionAction<D = unknown> {
  id: string;
  status: RequestResolutionStatus;
  data?: D;
}

export interface IMessageAction<P = unknown, M = unknown> {
  method: string;
  payload?: P;
  error?: boolean;
  meta?: M;
}

export interface IReduxAction<P = unknown, M = unknown> {
  type: string;
  payload?: P;
  error?: boolean;
  meta?: M;
}

export type { ICreateIdentityUiArgs } from "./identities";
export type { IHostPermission } from "./permissions";
