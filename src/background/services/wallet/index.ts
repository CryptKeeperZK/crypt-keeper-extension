import SimpleStorage from "../storage";

const WALLET_STORAGE_KEY = "@@WALLET@@";

interface WalletConnectionData {
  isDisconnectedPermanently: boolean;
}

export default class WalletService {
  private static INSTANCE: WalletService;

  private walletStorage: SimpleStorage;

  private constructor() {
    this.walletStorage = new SimpleStorage(WALLET_STORAGE_KEY);
  }

  static getInstance = (): WalletService => {
    if (!WalletService.INSTANCE) {
      WalletService.INSTANCE = new WalletService();
    }

    return WalletService.INSTANCE;
  };

  setConnection = async (payload: WalletConnectionData): Promise<void> => this.walletStorage.set(payload);

  getConnection = async (): Promise<WalletConnectionData | null> => this.walletStorage.get();
}
