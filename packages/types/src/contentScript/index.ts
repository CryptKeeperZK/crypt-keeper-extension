export interface IInjectedMessageData<P = unknown, M = unknown> {
  target: string;
  nonce: string;
  message: M;
  payload: [string, P];
}

export interface IInjectedProviderRequest<P = unknown, M = unknown> {
  method: string;
  payload?: P;
  error?: boolean;
  meta?: Record<string, M>;
  source?: "offscreen";
}
