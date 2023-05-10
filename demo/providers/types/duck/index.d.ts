import { RequestResolutionStatus } from "../request";
export declare type RequestResolutionAction<data = unknown> = {
    id: string;
    status: RequestResolutionStatus;
    data?: data;
};
export declare type MessageAction = {
    method: string;
    payload?: unknown;
    error?: boolean;
    meta?: unknown;
};
export declare type ReduxAction = {
    type: string;
    payload?: unknown;
    error?: boolean;
    meta?: unknown;
};
export type { SelectedIdentity } from "./identities";
