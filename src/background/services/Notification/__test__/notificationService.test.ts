import { browser } from "webextension-polyfill-ts";

import { NotificationService } from "@src/background/services/Notification";

import { CreateNotificationArgs } from "../Notification.interface";

describe("background/services/notification", () => {
  const defaultId = "1";
  const defaultTabs = [{ id: 1 }, { id: 2 }];
  const defaultCreateArgs: CreateNotificationArgs = {
    id: defaultId,
    options: {
      title: "Title",
      message: "Message",
      iconUrl: "/icon.png",
      type: "basic",
    },
  };

  beforeEach(() => {
    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.notifications.create as jest.Mock).mockResolvedValue(defaultId);

    (browser.notifications.clear as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("should create notification properly", async () => {
      const service = NotificationService.getInstance();
      const result = await service.create(defaultCreateArgs);

      expect(result).toStrictEqual([defaultId, defaultId]);
    });
  });

  describe("clear", () => {
    test("should clear notification properly", async () => {
      const service = NotificationService.getInstance();
      await service.create(defaultCreateArgs);

      const result = await service.clear(defaultId);

      expect(result).toStrictEqual([true, true]);
    });
  });
});
