/**
 * @jest-environment jsdom
 */

import { PendingRequestType, ConnectedIdentityMetadata } from "@cryptkeeperzk/types";
import { getMerkleProof } from "@cryptkeeperzk/zk";

import pushMessage from "@src/util/pushMessage";

import { InjectorService } from "..";

const mockDefaultHost = "http://localhost:3000";
const mockSerializedIdentity = "identity";
const mockConnectedIdentity: ConnectedIdentityMetadata = {
  name: "Account 1",
};
const mockNewRequest = jest.fn((_: PendingRequestType, { urlOrigin }: { urlOrigin: string }) =>
  urlOrigin === "reject"
    ? Promise.reject(new Error("User rejected your request."))
    : Promise.resolve({
        urlOrigin,
        canSkipApprove: true,
      }),
);
const mockGetConnectedIdentity = jest.fn();
const mockGenerateSemaphoreProof = jest.fn();
const mockGenerateRLNProof = jest.fn();

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

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
  ZkProofService: jest.fn(() => ({
    generateSemaphoreProof: mockGenerateSemaphoreProof,
    generateRLNProof: mockGenerateRLNProof,
  })),
  getMerkleProof: jest.fn(),
}));

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
    isApproved: jest.fn((urlOrigin) => urlOrigin === mockDefaultHost),
    canSkipApprove: jest.fn((urlOrigin) => urlOrigin === mockDefaultHost),
    getPermission: jest.fn(() => ({ canSkipApprove: false })),
  })),
}));

jest.mock("@src/background/services/lock", (): unknown => ({
  getInstance: jest.fn(() => ({
    getStatus: jest.fn(() => Promise.resolve({ isUnlocked: false })),
    awaitUnlock: jest.fn(),
  })),
}));

jest.mock("@src/background/services/zkIdentity", (): unknown => ({
  getInstance: jest.fn(() => ({
    getConnectedIdentity: mockGetConnectedIdentity,
    getConnectedIdentityData: jest.fn(() => mockConnectedIdentity),
  })),
}));

jest.mock("@src/util/pushMessage");

jest.mock("@src/background/shared/utils", (): unknown => ({
  getBrowserPlatform: jest.fn(),
  closeChromeOffscreen: jest.fn(),
  createChromeOffscreen: jest.fn(),
  throwErrorProperly: jest.fn((error: unknown, additionalMessage?: string) => {
    if (error instanceof Error) {
      throw new Error(`${additionalMessage}${error.message}`);
    } else {
      throw new Error(`Unknown error`);
    }
  }),
}));

describe("background/services/injector", () => {
  const defaultMetadata = { urlOrigin: mockDefaultHost };

  beforeEach(() => {
    (pushMessage as jest.Mock).mockClear();

    (getMerkleProof as jest.Mock).mockResolvedValue({});

    mockGetConnectedIdentity.mockResolvedValue({ serialize: () => mockSerializedIdentity });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("connect identity", () => {
    test("should connect identity properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.connectIdentity(defaultMetadata);

      expect(result).toStrictEqual(mockConnectedIdentity);
    });

    test("should throw error if there is no urlOrigin", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connectIdentity({ urlOrigin: "" })).rejects.toThrow("Error: CryptKeeper: Origin is not set");
    });

    test("should connect with approval request properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.connectIdentity({ urlOrigin: "new-urlOrigin" });

      expect(mockNewRequest).toHaveBeenCalledTimes(2);
      expect(result).toStrictEqual(mockConnectedIdentity);
    });

    test("should reject connect request properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connectIdentity({ urlOrigin: "reject" })).rejects.toThrow(
        "Error: CryptKeeper: error in the approve requestError: User rejected your request.",
      );
    });
  });
});
