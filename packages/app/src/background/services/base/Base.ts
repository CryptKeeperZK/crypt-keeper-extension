export abstract class BaseService {
  protected isUnlocked: boolean;

  protected unlockCB?: () => void;

  constructor() {
    this.isUnlocked = false;
  }

  abstract unlock(password?: string, notify?: boolean): Promise<boolean>;

  onUnlocked = (): boolean => {
    if (this.unlockCB) {
      this.unlockCB();
      this.unlockCB = undefined;
    }

    return true;
  };

  awaitUnlock = async (): Promise<void> => {
    if (this.isUnlocked) {
      return undefined;
    }

    return new Promise((resolve) => {
      this.unlockCB = () => {
        resolve(undefined);
      };
    });
  };
}
