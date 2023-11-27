import type { IZkMetadata } from "../proof";

export interface IInjectedMessageData<P = unknown, M = unknown> {
  target: string;
  nonce: string;
  message: M;
  payload: [string, P];
}

export interface IInjectedProviderRequest<P = unknown, M = IZkMetadata> {
  method: string;
  payload?: P;
  error?: boolean;
  meta?: M;
  source?: "offscreen";
}
