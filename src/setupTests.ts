import "@testing-library/jest-dom";
import "isomorphic-fetch";

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

type Changes = Record<string, { oldValue: string | null; newValue: string | null }>;

jest.mock("webextension-polyfill-ts", (): unknown => {
  const storageListeners: ((changes: Changes, namespace: string) => void)[] = [];
  const namespace = "namespace";
  const defaultChanges = { key: { oldValue: null, newValue: null } };

  return {
    browser: {
      tabs: {
        query: jest.fn().mockResolvedValue([]),
        sendMessage: jest.fn(),
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
