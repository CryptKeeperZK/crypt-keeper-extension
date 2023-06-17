import LockerService from "@src/background/services/lock";
import SimpleStorage from "@src/background/services/storage";

const VERIFIABLE_CREDENTIALS_KEY = "@@VERIFIABLE-CREDENTIALS@@";

export default class VerifiableCredentialsService {
  private static INSTANCE: VerifiableCredentialsService;

  private verifiableCredentialsStore: SimpleStorage;

  private lockService: LockerService;

  private constructor() {
    this.verifiableCredentialsStore = new SimpleStorage(VERIFIABLE_CREDENTIALS_KEY);
    this.lockService = LockerService.getInstance();
  }

  static getInstance(): VerifiableCredentialsService {
    if (!VerifiableCredentialsService.INSTANCE) {
      VerifiableCredentialsService.INSTANCE = new VerifiableCredentialsService();
    }

    return VerifiableCredentialsService.INSTANCE;
  }
}
