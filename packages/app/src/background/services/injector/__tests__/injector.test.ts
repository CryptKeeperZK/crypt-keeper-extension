/**
 * @jest-environment jsdom
 */

Object.defineProperty(global, "chrome", {
  value: {
    offscreen: {
      closeDocument: jest.fn(),
    },
  },
});

import browser from "webextension-polyfill";

import { PendingRequestType, RLNProofRequest, SemaphoreProofRequest } from "@src/types";
import pushMessage from "@src/util/pushMessage";

import InjectorService from "..";
import { IMeta } from "../types";

const mockDefaultHost = "http://localhost:3000";
const mockSerializedIdentity = "identity";
const mockGetConnectedIdentity = jest.fn();

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

jest.mock("@cryptkeeperzk/semaphore-proof", (): unknown => ({
  generateProof: jest.fn(),
}));

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
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
    newRequest: jest.fn((_: PendingRequestType, meta: IMeta) =>
      meta.origin === "reject" ? Promise.reject() : Promise.resolve(),
    ),
  })),
}));

jest.mock("@src/background/services/approval", (): unknown => ({
  getInstance: jest.fn(() => ({
    isApproved: jest.fn((host) => host === mockDefaultHost),
    canSkipApprove: jest.fn((host) => host === mockDefaultHost),
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
  })),
}));

jest.mock("@src/util/pushMessage");

describe("background/services/injector", () => {
  beforeEach(() => {
    (pushMessage as jest.Mock).mockClear();
    mockGetConnectedIdentity.mockResolvedValue({ serialize: () => mockSerializedIdentity });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("connect", () => {
    test("should connect properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.connect({ origin: mockDefaultHost });

      expect(result).toStrictEqual({
        canSkipApprove: true,
        isApproved: true,
      });
    });

    test("should throw error if there is no host", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ origin: "" })).rejects.toThrow("Origin not provided");
    });

    test("should connect with approval request properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.connect({ origin: "new-host" });

      expect(result).toStrictEqual({
        isApproved: true,
        canSkipApprove: false,
      });
    });

    test("should reject connect request properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.connect({ origin: "reject" });

      expect(result).toStrictEqual({
        isApproved: false,
        canSkipApprove: false,
      });
    });
  });

  describe("semaphore", () => {
    beforeEach(() => {
      (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const defaultProofRequest: SemaphoreProofRequest = {
      identitySerialized: "identitySerialized",
      externalNullifier: "externalNullifier",
      signal: "signal",
      merkleStorageAddress: "merkleStorageAddress",
      circuitFilePath: "js/zkeyFiles/semaphore/semaphore.wasm",
      zkeyFilePath: "js/zkeyFiles/semaphore/semaphore.zkey",
      verificationKey: "js/zkeyFiles/semaphore/semaphore.json",
      merkleProofArtifacts: {
        leaves: ["0"],
        depth: 1,
        leavesPerNode: 1,
      },
      merkleProof: {
        root: "0",
        leaf: "0",
        siblings: ["0"],
        pathIndices: [0],
      },
    };

    test("should prepare semaphore proof properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.prepareSemaphoreProofRequest(defaultProofRequest, { origin: mockDefaultHost });

      expect(result).toStrictEqual({
        identity: mockSerializedIdentity,
        payload: {
          ...defaultProofRequest,
        },
      });
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.prepareSemaphoreProofRequest(defaultProofRequest, { origin: "new-host" })).rejects.toThrow(
        "connected identity not found",
      );
    });

    test("should throw error if host isn't approved", async () => {
      const service = InjectorService.getInstance();

      await expect(service.prepareSemaphoreProofRequest(defaultProofRequest, { origin: "new-host" })).rejects.toThrow(
        "new-host is not approved",
      );
    });

    test("should be able to generate semaphore proof", async () => {
      const service = InjectorService.getInstance();

      await service.connect({ origin: mockDefaultHost });
      await service.generateSemaphoreProof(defaultProofRequest, { origin: mockDefaultHost });
      expect(pushMessage).toBeCalledTimes(1);
    });
  });

  describe("rln", () => {
    beforeEach(() => {
      (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const defaultProofRequest: RLNProofRequest = {
      identitySerialized: "identitySerialized",
      rlnIdentifier: "rlnIdentifier",
      externalNullifier: "externalNullifier",
      signal: "signal",
      merkleStorageAddress: "merkleStorageAddress",
      circuitFilePath: "js/zkeyFiles/rln/rln.wasm",
      zkeyFilePath: "js/zkeyFiles/rln/rln.zkey",
      verificationKey: "js/zkeyFiles/rln/rln.json",
      merkleProofArtifacts: {
        leaves: ["0"],
        depth: 1,
        leavesPerNode: 1,
      },
      merkleProof: {
        root: "0",
        leaf: "0",
        siblings: ["0"],
        pathIndices: [0],
      },
    };

    test("should prepare rln proof properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.prepareRlnProofRequest(defaultProofRequest, { origin: mockDefaultHost });

      expect(result).toStrictEqual({
        identity: mockSerializedIdentity,
        payload: {
          ...defaultProofRequest,
        },
      });
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.prepareRlnProofRequest(defaultProofRequest, { origin: "new-host" })).rejects.toThrow(
        "connected identity not found",
      );
    });

    test("should throw error if host isn't approved", async () => {
      const service = InjectorService.getInstance();

      await expect(service.prepareRlnProofRequest(defaultProofRequest, { origin: "new-host" })).rejects.toThrow(
        "new-host is not approved",
      );
    });
  });
});
