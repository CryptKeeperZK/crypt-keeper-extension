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

  setConnection = async (payload: WalletConnectionData): Promise<void> => this.walletStorage.set(payload);

  getConnection = async (): Promise<WalletConnectionData | null> => this.walletStorage.get();
}
