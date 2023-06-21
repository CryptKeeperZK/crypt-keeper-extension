import { InitializationStep } from "@src/types";

import SimpleStorage from "../storage";

import { InitializationData, ExteranalWalletConnectionData } from "./types";

const WALLET_STORAGE_KEY = "@@WALLET@@";
const INITIALIZATION_STORAGE_KEY = "@@INITIALIZED@@";

export default class MiscStorageService {
  private static INSTANCE: MiscStorageService;

  private externalWalletStorage: SimpleStorage;

  private initializationStorage: SimpleStorage;

  private constructor() {
    this.externalWalletStorage = new SimpleStorage(WALLET_STORAGE_KEY);
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

  setExternalWalletConnection = async (payload: ExteranalWalletConnectionData): Promise<void> =>
    this.externalWalletStorage.set(payload);

  getExternalWalletConnection = async (): Promise<ExteranalWalletConnectionData | null> =>
    this.externalWalletStorage.get();
}
