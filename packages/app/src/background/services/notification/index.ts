import browser from "webextension-polyfill";

export interface CreateNotificationArgs {
  id?: string;
  options: {
    title: string;
    message: string;
    type: "basic" | "image" | "list" | "progress";
    iconUrl?: string;
  };
}

export default class NotificationService {
  private static INSTANCE: NotificationService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.INSTANCE) {
      NotificationService.INSTANCE = new NotificationService();
    }

    return NotificationService.INSTANCE;
  }

  create = async ({ id, options }: CreateNotificationArgs): Promise<string[]> => {
    const tabs = await this.getTabs();
    const notificationIds = await Promise.all(tabs.map(() => browser.notifications.create(id, options)));

    return notificationIds;
  };

  clear = async (id: string): Promise<boolean[]> => {
    const tabs = await this.getTabs();
    const result = await Promise.all(tabs.map(() => browser.notifications.clear(id)));

    return result;
  };

  private getTabs = async (): Promise<{ id?: number }[]> => browser.tabs.query({ active: true });
}
