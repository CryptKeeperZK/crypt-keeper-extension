import SimpleStorage from "./simpleStorage";

const WALLET_STORAGE_KEY = "@@WALLET@@";

export default class WalletService {
  private walletStorage: SimpleStorage;

  constructor() {
    this.walletStorage = new SimpleStorage(WALLET_STORAGE_KEY);
  }

  public setConnection = async (payload: { isDisconnectedPermanently: boolean }) => {
    return this.walletStorage.set(payload);
  };

  public getConnection = async (): Promise<{ isDisconnectedPermanently: boolean } | null > => {
    return this.walletStorage.get();
  };
}
