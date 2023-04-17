import { SimpleStorageService } from "@src/background/services/Storage";

import { WalletConnectionData } from "./Wallet.inteface";

const WALLET_STORAGE_KEY = "@@WALLET@@";

export class WalletService {
  private walletStorage: SimpleStorageService;

  public constructor() {
    this.walletStorage = new SimpleStorageService(WALLET_STORAGE_KEY);
  }

  public setConnection = async (payload: WalletConnectionData): Promise<void> => this.walletStorage.set(payload);

  public getConnection = async (): Promise<WalletConnectionData | null> => this.walletStorage.get();
}
