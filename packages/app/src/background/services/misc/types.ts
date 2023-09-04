import type { InitializationStep } from "@src/types";

export interface ExternalWalletConnectionData {
  isDisconnectedPermanently: boolean;
}

export interface InitializationData {
  initializationStep: InitializationStep;
}
