export interface InjectedMessageData<P = unknown, M = unknown> {
  target: string;
  nonce: string;
  message: M;
  payload: [string, P];
}

export interface InjectedProviderRequest<P = unknown, M = unknown> {
  method: string;
  payload?: P;
  error?: boolean;
  meta?: Record<string, M>;
  source?: "offscreen";
}
