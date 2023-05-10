export declare enum RequestResolutionStatus {
    ACCEPT = "accept",
    REJECT = "reject"
}
export declare type RequestHandler = {
    method: string;
    payload?: unknown;
    error?: boolean;
    meta?: unknown;
};
export declare enum PendingRequestType {
    SEMAPHORE_PROOF = 0,
    RLN_PROOF = 1,
    APPROVE = 2,
    INJECT = 3
}
export interface PendingRequest<P = unknown> {
    id: string;
    windowId?: number;
    type: PendingRequestType;
    payload?: P;
}
