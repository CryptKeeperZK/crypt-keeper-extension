import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";
import "@testing-library/jest-dom";
import "isomorphic-fetch";

import type { Events, EventHandler, EventName } from "@src/background/services/event/types";
import type { ReactElement } from "react";

jest.retryTimes(1, { logErrorsBeforeRetry: true });

library.add(faTwitter, faGithub, faReddit);

jest.mock("loglevel", () => ({
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("react", (): unknown => ({
  ...jest.requireActual("react"),
  Suspense: ({ children }: { children: ReactElement }) => children,
}));

jest.mock("link-preview-js", (): unknown => ({
  getLinkPreview: jest.fn().mockResolvedValue({
    favicons: ["http://localhost:3000/favicon.ico"],
  }),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(() => Promise.resolve()),
  useAppSelector: jest.fn(),
}));

jest.mock("@src/util/postMessage");

jest.mock("@src/util/pushMessage");

jest.mock("@src/config/features", (): unknown => ({
  ...jest.requireActual("@src/config/features"),
  getEnabledFeatures: jest.fn().mockReturnValue({ INTERREP_IDENTITY: true, BACKUP: true }),
}));

type Changes = Record<string, { oldValue: string | null; newValue: string | null }>;

jest.mock("webextension-polyfill-ts", (): unknown => {
  const storageListeners: ((changes: Changes, namespace: string) => void)[] = [];
  const windowRemoveListeners: ((windowId: number) => void)[] = [];
  const namespace = "namespace";
  const defaultChanges = { key: { oldValue: null, newValue: null } };

  return {
    browser: {
      tabs: {
        query: jest.fn().mockResolvedValue([]),
        sendMessage: jest.fn().mockResolvedValue(true),
        create: jest.fn(),
      },

      windows: {
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn().mockImplementation((windowId: number) => {
          windowRemoveListeners.forEach((listener) => listener(windowId));
        }),
        onRemoved: {
          addListener: jest.fn().mockImplementation((fun: (windowId: number) => void) => {
            windowRemoveListeners.push(fun);
          }),
          removeListener: jest.fn(),
        },
      },

      runtime: {
        connect: jest.fn(),
        getURL: jest.fn(),
      },

      notifications: {
        create: jest.fn(),
        clear: jest.fn(),
      },

      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn().mockImplementation(() => {
            storageListeners.forEach((listener) => listener(defaultChanges, namespace));
          }),
          remove: jest.fn().mockImplementation(() => {
            storageListeners.forEach((listener) => listener(defaultChanges, namespace));
          }),
        },
        onChanged: {
          addListener: (fun: () => void) => {
            storageListeners.push(fun);
          },
        },
      },
    },
  };
});

export const events: Events = {
  identityChanged: () => false,
  login: () => false,
  logout: () => false,
};

jest.mock("nanoevents", (): unknown => ({
  createNanoEvents: jest.fn(() => ({
    on: jest.fn().mockImplementation((eventName: EventName, cb: EventHandler) => {
      events[eventName] = cb;
    }),

    emit: jest.fn().mockImplementation((eventName: EventName, payload: number) => {
      const cb = events[eventName];
      cb(payload);
    }),
  })),
}));

jest.mock("@src/providers", (): unknown => ({
  initializeInjectedProvider: jest.fn(),
}));
