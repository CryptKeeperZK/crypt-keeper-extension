import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

import { CreateNotificationArgs } from "./Notification.interface";

export class NotificationService {
  private static INSTANCE: NotificationService;

  private constructor() {
    log.debug("Notification service was initialized");
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.INSTANCE) {
      NotificationService.INSTANCE = new NotificationService();
    }

    return NotificationService.INSTANCE;
  }

  public create = async ({ id, options }: CreateNotificationArgs): Promise<string[]> => {
    const tabs = await this.getTabs();
    const notificationIds = await Promise.all(tabs.map(() => browser.notifications.create(id, options)));

    return notificationIds;
  };

  public clear = async (id: string): Promise<boolean[]> => {
    const tabs = await this.getTabs();
    const result = await Promise.all(tabs.map(() => browser.notifications.clear(id)));

    return result;
  };

  private getTabs = async (): Promise<{ id?: number }[]> => browser.tabs.query({ active: true });
}
