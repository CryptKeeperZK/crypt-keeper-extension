import type { InitializationStep } from "@src/types";

export interface ExteranalWalletConnectionData {
  isDisconnectedPermanently: boolean;
}

export interface InitializationData {
  initializationStep: InitializationStep;
}
