export abstract class BaseService {
  protected isUnlocked: boolean;

  protected unlockCB?: () => void;

  constructor() {
    this.isUnlocked = false;
  }

  abstract unlock(password?: string, notify?: boolean): Promise<boolean>;

  lock(): void {
    this.isUnlocked = false;
    this.unlockCB = undefined;
  }

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

  abstract lock(): Promise<boolean>;

  onLock = async (internalLock?: () => Promise<unknown>): Promise<boolean> => {
    this.isUnlocked = false;
    this.unlockCB = undefined;

    if (internalLock) {
      await internalLock();
    }

    return true;
  };
}
