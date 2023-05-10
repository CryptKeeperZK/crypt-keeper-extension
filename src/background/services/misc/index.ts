import SimpleStorage from "../storage";

const WALLET_STORAGE_KEY = "@@WALLET@@";
const INITIALIZATION_STORAGE_KEY = "@@INITIALIZED@@";

export interface WalletConnectionData {
  isDisconnectedPermanently: boolean;
}

export interface InitializationData {
  initializationStep: InitializationStep;
}

export enum InitializationStep {
  NEW,
  PASSWORD,
  MNEMONIC,
}

export default class MiscStorageService {
  private static INSTANCE: MiscStorageService;

  private walletStorage: SimpleStorage;

  private initializationStorage: SimpleStorage;

  private constructor() {
    this.walletStorage = new SimpleStorage(WALLET_STORAGE_KEY);
    this.initializationStorage = new SimpleStorage(INITIALIZATION_STORAGE_KEY);
  }

  static getInstance = (): MiscStorageService => {
    if (!MiscStorageService.INSTANCE) {
      MiscStorageService.INSTANCE = new MiscStorageService();
    }

    return MiscStorageService.INSTANCE;
  };

  getInitialization = async (): Promise<InitializationStep> =>
    this.initializationStorage
      .get<InitializationData>()
      .then((res) => res?.initializationStep ?? InitializationStep.NEW);

  setInitialization = async (payload: InitializationData): Promise<void> => this.initializationStorage.set(payload);

  setConnection = async (payload: WalletConnectionData): Promise<void> => this.walletStorage.set(payload);

  getConnection = async (): Promise<WalletConnectionData | null> => this.walletStorage.get();
}
