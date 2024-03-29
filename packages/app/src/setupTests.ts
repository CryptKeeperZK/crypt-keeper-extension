import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";
import { faLink, faUsersRays } from "@fortawesome/free-solid-svg-icons";
import "@testing-library/jest-dom";
import "isomorphic-fetch";

import type { ReactElement } from "react";

jest.retryTimes(1, { logErrorsBeforeRetry: true });

library.add(faTwitter, faGithub, faReddit, faLink, faUsersRays);

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

jest.mock("@src/util/browser");

jest.mock("@src/config/features", (): unknown => ({
  ...jest.requireActual("@src/config/features"),
  getEnabledFeatures: jest.fn().mockReturnValue({ USER_MNEMONIC: true, VERIFIABLE_CREDENTIALS: true }),
}));

jest.mock("@src/config/env", (): unknown => ({
  ...jest.requireActual("@src/config/env"),
  isE2E: jest.fn(() => true),
}));

type Changes = Record<string, { oldValue: string | null; newValue: string | null }>;

jest.mock("webextension-polyfill", (): unknown => {
  const storageListeners: ((changes: Changes, namespace: string) => void)[] = [];
  const windowRemoveListeners: ((windowId: number) => void)[] = [];
  const namespace = "namespace";
  const defaultChanges = { key: { oldValue: null, newValue: null } };

  return {
    __esModule: true,
    default: {
      tabs: {
        query: jest.fn().mockResolvedValue([]),
        sendMessage: jest.fn().mockResolvedValue(true),
        create: jest.fn(),
      },

      windows: {
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn().mockImplementation((windowId: number) => {
          windowRemoveListeners.forEach((listener) => {
            listener(windowId);
          });
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
        sendMessage: jest.fn(),
        getURL: jest.fn(),
      },

      extension: {
        getViews: jest.fn(() => []),
      },

      notifications: {
        create: jest.fn(),
        clear: jest.fn(),
      },

      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn().mockImplementation(() => {
            storageListeners.forEach((listener) => {
              listener(defaultChanges, namespace);
            });
          }),
          remove: jest.fn().mockImplementation(() => {
            storageListeners.forEach((listener) => {
              listener(defaultChanges, namespace);
            });
          }),
          clear: jest.fn(),
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

jest.mock("@cryptkeeperzk/providers", (): unknown => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  EventName: jest.requireActual("@cryptkeeperzk/providers"),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  RPCExternalAction: jest.requireActual("@cryptkeeperzk/providers"),
  initializeCryptKeeperProvider: jest.fn(),
}));
