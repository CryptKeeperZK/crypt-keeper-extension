import "@testing-library/jest-dom";

jest.mock("loglevel", () => ({
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

type Changes = Record<string, { oldValue: string | null; newValue: string | null }>;

jest.mock("webextension-polyfill-ts", (): unknown => {
  const listeners: ((changes: Changes, namespace: string) => void)[] = [];
  const namespace = "namespace";
  const defaultChanges = { key: { oldValue: null, newValue: null } };

  return {
    browser: {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn().mockImplementation(() => {
            listeners.forEach(listener => listener(defaultChanges, namespace));
          }),
          remove: jest.fn().mockImplementation(() => {
            listeners.forEach(listener => listener(defaultChanges, namespace));
          }),
        },
        onChanged: {
          addListener: (fun: () => void) => {
            listeners.push(fun);
          },
        },
      },
    },
  };
});
