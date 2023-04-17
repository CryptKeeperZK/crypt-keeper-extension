export interface InjectedMessageData<M = unknown, P = unknown> {
  target: string;
  nonce: string;
  message: M;
  payload: [string, P];
}
