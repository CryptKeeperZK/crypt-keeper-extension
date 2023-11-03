/**
 * @jest-environment jsdom
 */

import { PendingRequestType, type ConnectedIdentityMetadata } from "@cryptkeeperzk/types";

import { mockDefaultIdentity } from "@src/config/mock/zk";

import { InjectorService } from "..";

const mockDefaultUrlOrigin = "http://localhost:3000";
const mockSerializedIdentity = "identity";
const mockConnectedIdentity: ConnectedIdentityMetadata = {
  name: "Account #1",
};
const mockNewRequest = jest.fn((type: PendingRequestType, { urlOrigin }: { urlOrigin: string }): Promise<unknown> => {
  if (urlOrigin.includes("reject")) {
    return Promise.reject(new Error("User rejected your request."));
  }

  if (type === PendingRequestType.APPROVE) {
    return Promise.resolve({ urlOrigin, canSkipApprove: false });
  }

  return Promise.resolve();
});

const mockGetConnectedIdentity = jest.fn();
const mockConnectRequest = jest.fn();
const mockIsApproved = jest.fn(
  (urlOrigin) =>
    urlOrigin === mockDefaultUrlOrigin ||
    urlOrigin === "empty_connected_identity" ||
    urlOrigin === "reject_semaphore_proof" ||
    urlOrigin === "reject_rln_proof" ||
    urlOrigin === "reject-joinGroup",
);
const mockCanSkip = jest.fn((urlOrigin) => urlOrigin === mockDefaultUrlOrigin);
const mockGetStatus = jest.fn(() => Promise.resolve({ isUnlocked: false, isInitialized: false }));
const mockAwaitLockServiceUnlock = jest.fn();
const mockAwaitApprovalServiceUnlock = jest.fn();

Object.defineProperty(global, "chrome", {
  value: {
    offscreen: {
      closeDocument: jest.fn(),
      hasDocument: jest.fn(),
      createDocument: jest.fn(),
      Reason: jest.fn(() => ({
        DOM_SCRAPING: "DOM_SCRAPING",
      })),
    },
  },
});

jest.mock("@src/background/controllers/browserUtils", (): unknown => ({
  getInstance: jest.fn(() => ({
    closePopup: jest.fn(),
    openPopup: jest.fn(),
  })),
}));

jest.mock("@src/background/controllers/requestManager", (): unknown => ({
  getInstance: jest.fn(() => ({
    newRequest: mockNewRequest,
  })),
}));

jest.mock("@src/background/services/approval", (): unknown => ({
  getInstance: jest.fn(() => ({
    add: jest.fn(),
    isApproved: mockIsApproved,
    canSkipApprove: mockCanSkip,
    getPermission: jest.fn(() => ({ canSkipApprove: false })),
    awaitUnlock: mockAwaitApprovalServiceUnlock,
  })),
}));

jest.mock("@src/background/services/connection", (): unknown => ({
  getInstance: jest.fn(() => ({
    getConnectedIdentity: mockGetConnectedIdentity,
    connectRequest: mockConnectRequest,
    awaitUnlock: jest.fn(),
  })),
}));

jest.mock("@src/background/services/zkIdentity", (): unknown => ({
  getInstance: jest.fn(() => ({
    awaitUnlock: jest.fn(),
  })),
}));

jest.mock("@src/background/services/lock", (): unknown => ({
  getInstance: jest.fn(() => ({
    getStatus: mockGetStatus,
    awaitUnlock: mockAwaitLockServiceUnlock,
  })),
}));

jest.mock("@src/util/pushMessage");

jest.mock("@src/background/shared/utils", (): unknown => ({
  getBrowserPlatform: jest.fn(),
  closeChromeOffscreen: jest.fn(),
  createChromeOffscreen: jest.fn(),
}));

describe("background/services/injector", () => {
  const defaultMetadata = { urlOrigin: mockDefaultUrlOrigin };

  beforeEach(() => {
    mockGetConnectedIdentity.mockReturnValue({ ...mockDefaultIdentity, serialize: () => mockSerializedIdentity });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get connected identity metadata", () => {
    test("should return connected metadata properly if all checks are passed", () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true, isInitialized: true });
      const service = InjectorService.getInstance();

      const result = service.getConnectedIdentityMetadata({}, { urlOrigin: mockDefaultUrlOrigin });
      expect(result).toStrictEqual(mockConnectedIdentity);
      expect(mockIsApproved).toHaveBeenCalledTimes(1);
      expect(mockCanSkip).toHaveBeenCalledTimes(1);
      expect(mockAwaitLockServiceUnlock).toHaveBeenCalledTimes(0);
    });

    test("should throw error if there is no url origin", () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true, isInitialized: true });

      const service = InjectorService.getInstance();

      expect(() => service.getConnectedIdentityMetadata({}, { urlOrigin: "" })).toThrow(
        "CryptKeeper: Origin is not set",
      );
    });

    test("should return undefined if origin isn't approved", () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: false, isInitialized: true });

      const service = InjectorService.getInstance();

      const result = service.getConnectedIdentityMetadata({}, { urlOrigin: "new-urlOrigin" });

      expect(result).toBeUndefined();
    });

    test("should return undefined if no connected identity found", () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true, isInitialized: true });
      mockGetConnectedIdentity.mockReturnValue(undefined);

      const service = InjectorService.getInstance();

      const result = service.getConnectedIdentityMetadata({}, { urlOrigin: "empty_connected_identity" });

      expect(result).toBeUndefined();
    });
  });

  describe("connect", () => {
    test("should connect properly if not connected identity found", async () => {
      mockGetConnectedIdentity.mockReturnValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, defaultMetadata)).resolves.not.toThrow();
      expect(mockConnectRequest).toHaveBeenCalledTimes(1);
    });

    test("should connect properly if connected identity found", async () => {
      mockGetConnectedIdentity.mockReturnValue(mockDefaultIdentity);

      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, defaultMetadata)).resolves.not.toThrow();
      expect(mockConnectRequest).toHaveBeenCalledTimes(0);
    });

    test("should connect properly if change identity request added", async () => {
      mockGetConnectedIdentity.mockReturnValue(mockDefaultIdentity);

      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: true }, defaultMetadata)).resolves.not.toThrow();
      expect(mockConnectRequest).toHaveBeenCalledTimes(1);
    });

    test("should throw error if there is no url origin", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, { urlOrigin: "" })).rejects.toThrow(
        "CryptKeeper: Origin is not set",
      );
    });

    test("should connect with approval request properly", async () => {
      mockGetConnectedIdentity.mockReturnValue(mockDefaultIdentity);

      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, { urlOrigin: "new-urlOrigin" })).resolves.not.toThrow();
      expect(mockNewRequest).toHaveBeenCalledTimes(1);
    });

    test("should reject connect request from the approve connection page properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, { urlOrigin: "reject_approve" })).rejects.toThrow(
        "CryptKeeper: error in the connect request, User rejected your request.",
      );
    });

    test("should reject connect request from the connect identity page properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, { urlOrigin: "reject_connect" })).rejects.toThrow(
        "CryptKeeper: error in the connect request, User rejected your request.",
      );
    });
  });
});
