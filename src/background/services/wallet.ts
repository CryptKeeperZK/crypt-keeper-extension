import { setWalletConnection } from "@src/ui/ducks/wallet";
import pushMessage from "@src/util/pushMessage";

import SimpleStorage from "./simpleStorage";

const WALLET_STORAGE_KEY = "@@WALLET@@";

interface WalletConnectionData {
  isDisconnectedPermanently: boolean;
}

export default class WalletService {
  private walletStorage: SimpleStorage;

  constructor() {
    this.walletStorage = new SimpleStorage(WALLET_STORAGE_KEY);
  }

  public setConnection = async (payload: WalletConnectionData): Promise<void> => {
    pushMessage(setWalletConnection(payload));

    await this.walletStorage.set(payload);
  };

  public getConnection = async (): Promise<void> => {
    const walletConnectionData = await this.walletStorage.get<WalletConnectionData>();

    if (walletConnectionData) pushMessage(setWalletConnection(walletConnectionData));
  };
}
