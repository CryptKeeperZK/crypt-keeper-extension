export interface InjectedMessageData<M = unknown, P = unknown> {
  target: string;
  nonce: string;
  message: M;
  payload: [string, P];
}

export interface InjectedProviderRequest {
  method: string;
  payload?: unknown;
  error?: boolean;
  meta?: Record<string, unknown>;
}
