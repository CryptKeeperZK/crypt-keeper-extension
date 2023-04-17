import { RequestResolutionStatus } from "../Request";

export type RequestResolutionAction<data = unknown> = {
  id: string;
  status: RequestResolutionStatus;
  data?: data;
};

export type MessageAction = {
  method: string;
  payload?: unknown;
  error?: boolean;
  meta?: unknown;
};

export type ReduxAction = {
  type: string;
  payload?: unknown;
  error?: boolean;
  meta?: unknown;
};
