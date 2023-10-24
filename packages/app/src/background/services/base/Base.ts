export abstract class BaseService {
  protected isUnlocked: boolean;

  protected unlockCB?: () => void;

  constructor() {
    this.isUnlocked = false;
  }

  abstract unlock(password?: string, notify?: boolean): Promise<boolean>;

  abstract lock(): Promise<boolean>;

  onUnlocked = (): boolean => {
    this.unlockCB?.();
    this.unlockCB = undefined;

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

  onLock = async (internalLock?: () => Promise<unknown> | boolean): Promise<boolean> => {
    this.isUnlocked = false;
    this.unlockCB = undefined;

    await internalLock?.();

    return true;
  };
}
