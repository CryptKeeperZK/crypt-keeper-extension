/**
 * @jest-environment jsdom
 */

import { PendingRequestType, type ConnectedIdentityMetadata, type IZkMetadata } from "@cryptkeeperzk/types";

import { mockDefaultIdentity } from "@src/config/mock/zk";
import pushMessage from "@src/util/pushMessage";

import { InjectorService } from "..";

const mockDefaultUrlOrigin = "http://localhost:3000";
const mockSerializedIdentity = "identity";
const mockConnectedIdentity: ConnectedIdentityMetadata = {
  name: "Account 1",
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
const mockGetConnectedIdentityData = jest.fn(
  (_: unknown, meta?: IZkMetadata): Promise<ConnectedIdentityMetadata | undefined> => {
    if (meta?.urlOrigin === mockDefaultUrlOrigin || meta?.urlOrigin === "new-urlOrigin") {
      return Promise.resolve({ ...mockConnectedIdentity, ...meta });
    }

    return Promise.resolve(undefined);
  },
);
const mockConnectRequest = jest.fn();
const mockConnectIdentityRequest = jest.fn();
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
const mockAwaitZkIdentityServiceUnlock = jest.fn();
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

jest.mock("@src/background/services/lock", (): unknown => ({
  getInstance: jest.fn(() => ({
    getStatus: mockGetStatus,
    awaitUnlock: mockAwaitLockServiceUnlock,
  })),
}));

jest.mock("@src/background/services/zkIdentity", (): unknown => ({
  getInstance: jest.fn(() => ({
    getConnectedIdentity: mockGetConnectedIdentity,
    getConnectedIdentityData: mockGetConnectedIdentityData,
    connectRequest: mockConnectRequest,
    awaitUnlock: mockAwaitZkIdentityServiceUnlock,
    connectIdentityRequest: mockConnectIdentityRequest,
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
    (pushMessage as jest.Mock).mockReset();

    mockGetConnectedIdentity.mockResolvedValue({ serialize: () => mockSerializedIdentity });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get connected identity metadata", () => {
    test("should return connected metadata properly if all checks are passed", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true, isInitialized: true });
      const service = InjectorService.getInstance();

      const result = await service.getConnectedIdentityMetadata({}, { urlOrigin: mockDefaultUrlOrigin });
      expect(result).toStrictEqual({ ...mockConnectedIdentity, urlOrigin: mockDefaultUrlOrigin });
      expect(mockIsApproved).toBeCalledTimes(1);
      expect(mockCanSkip).toBeCalledTimes(1);
      expect(mockAwaitLockServiceUnlock).toBeCalledTimes(0);
      expect(mockGetConnectedIdentityData).toBeCalledTimes(1);
    });

    test("should throw error if there is no urlOrigin", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true, isInitialized: true });

      const service = InjectorService.getInstance();

      await expect(service.getConnectedIdentityMetadata({}, { urlOrigin: "" })).rejects.toThrow(
        "CryptKeeper: Origin is not set",
      );
    });

    test("should send undefined if origin isn't approved", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: false, isInitialized: true });

      const service = InjectorService.getInstance();

      const result = await service.getConnectedIdentityMetadata({}, { urlOrigin: "new-urlOrigin" });

      expect(result).toStrictEqual(undefined);
    });

    test("should throw error if no connected identity found", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true, isInitialized: true });

      const service = InjectorService.getInstance();

      await expect(service.getConnectedIdentityMetadata({}, { urlOrigin: "empty_connected_identity" })).rejects.toThrow(
        "CryptKeeper: identity metadata is not found",
      );
    });
  });

  describe("checks", () => {
    test("should check if origin is connected properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.isConnected({}, { urlOrigin: mockDefaultUrlOrigin });

      expect(result).toStrictEqual({});
    });

    test("should throw error if origin is not connected", async () => {
      const service = InjectorService.getInstance();

      await expect(service.isConnected({}, { urlOrigin: "" })).rejects.toThrowError(
        "CryptKeeper: identity metadata is not found",
      );
    });
  });

  describe("connect", () => {
    test("should connect properly if not connected identity found", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, defaultMetadata)).resolves.not.toThrowError();
      expect(mockConnectIdentityRequest).toHaveBeenCalledTimes(1);
    });

    test("should connect properly if connected identity found", async () => {
      mockGetConnectedIdentity.mockResolvedValue(mockDefaultIdentity);

      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, defaultMetadata)).resolves.not.toThrowError();
      expect(mockConnectIdentityRequest).toHaveBeenCalledTimes(0);
    });

    test("should connect properly if change identity request added", async () => {
      mockGetConnectedIdentity.mockResolvedValue(mockDefaultIdentity);

      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: true }, defaultMetadata)).resolves.not.toThrowError();
      expect(mockConnectIdentityRequest).toHaveBeenCalledTimes(1);
    });

    test("should throw error if there is no urlOrigin", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ isChangeIdentity: false }, { urlOrigin: "" })).rejects.toThrow(
        "CryptKeeper: Origin is not set",
      );
    });

    test("should connect with approval request properly", async () => {
      mockGetConnectedIdentity.mockResolvedValue(mockDefaultIdentity);

      const service = InjectorService.getInstance();

      await expect(
        service.connect({ isChangeIdentity: false }, { urlOrigin: "new-urlOrigin" }),
      ).resolves.not.toThrowError();
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
