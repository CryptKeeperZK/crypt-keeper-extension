import "@testing-library/jest-dom";
import "isomorphic-fetch";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.window = {};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.window = global;

jest.mock("loglevel", () => ({
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

jest.mock("link-preview-js", (): unknown => ({
  getLinkPreview: jest.fn().mockResolvedValue({
    favicons: ["http://localhost:3000/favicon.ico"],
  }),
}));

jest.mock("@src/util/postMessage");

jest.mock("@src/util/pushMessage");

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
        sendMessage: jest.fn(),
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
