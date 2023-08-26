/**
 * @jest-environment jsdom
 */

import { RPCAction } from "@cryptkeeperzk/providers";
import { generateProof } from "@cryptkeeperzk/semaphore-proof";
import browser from "webextension-polyfill";

import { getBrowserPlatform } from "@src/background/shared/utils";
import { BrowserPlatform } from "@src/constants";
import { PendingRequestType, IRlnProofRequest, ISemaphoreProofRequest, IZkMetadata } from "@src/types";
import pushMessage from "@src/util/pushMessage";

import InjectorService from "..";

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
    newRequest: jest.fn((_: PendingRequestType, meta: IZkMetadata) =>
      meta.urlOrigin === "reject" ? Promise.reject() : Promise.resolve(),
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

jest.mock("@src/background/shared/utils", (): unknown => ({
  getBrowserPlatform: jest.fn(),
  closeChromeOffscreen: jest.fn(),
  createChromeOffscreen: jest.fn(),
}));

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

      const result = await service.connect({ urlOrigin: mockDefaultHost });

      expect(result).toStrictEqual({
        canSkipApprove: true,
        isApproved: true,
      });
    });

    test("should throw error if there is no host", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ urlOrigin: "" })).rejects.toThrow("Origin is not set");
    });

    test("should connect with approval request properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.connect({ urlOrigin: "new-host" });

      expect(result).toStrictEqual({
        isApproved: true,
        canSkipApprove: false,
      });
    });

    test("should reject connect request properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.connect({ urlOrigin: "reject" });

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

    const defaultProofRequest: ISemaphoreProofRequest = {
      identitySerialized: "identitySerialized",
      externalNullifier: "externalNullifier",
      signal: "signal",
      merkleStorageAddress: "merkleStorageAddress",
      merkleProofArtifacts: {
        leaves: ["0"],
        depth: 1,
        leavesPerNode: 1,
      },
      merkleProofProvided: {
        root: "0",
        leaf: "0",
        siblings: ["0"],
        pathIndices: [0],
      },
      circuitFilePath: "js/zkeyFiles/semaphore/semaphore.wasm",
      zkeyFilePath: "js/zkeyFiles/semaphore/semaphore.zkey",
      verificationKey: "js/zkeyFiles/semaphore/semaphore.json",
    };

    const emptyFullProof = {
      fullProof: {
        proof: {},
        publicSignals: {},
      },
    };

    test("should prepare semaphore proof properly on Chrome platform browsers", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(emptyFullProof);
      const service = InjectorService.getInstance();

      const result = await service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: mockDefaultHost });

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith({
        method: RPCAction.GENERATE_SEMAPHORE_PROOF,
        payload: { ...defaultProofRequest, urlOrigin: mockDefaultHost, identitySerialized: mockSerializedIdentity },
        meta: mockDefaultHost,
        source: "offscreen",
      });
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: "new-host" })).rejects.toThrow(
        "connected identity not found",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if host isn't approved", async () => {
      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: "new-host" })).rejects.toThrow(
        "new-host is not approved",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should prepare semaphore proof properly on Firefox platform browsers", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (generateProof as jest.Mock).mockReturnValueOnce(emptyFullProof);
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);
      const service = InjectorService.getInstance();

      const result = await service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: mockDefaultHost });
      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error there is no circuit and zkey files", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);
      (browser.runtime.getURL as jest.Mock).mockReturnValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: mockDefaultHost })).rejects.toThrow(
        "Error in generateSemaphoreProof(): Injected service: Must set circuitFilePath and zkeyFilePath",
      );
    });
  });

  describe("rln", () => {
    beforeEach(() => {
      (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const defaultProofRequest: IRlnProofRequest = {
      identitySerialized: "identitySerialized",
      rlnIdentifier: "rlnIdentifier",
      message: "message",
      messageId: 0,
      messageLimit: 1,
      merkleStorageAddress: "merkleStorageAddress",
      circuitFilePath: "js/zkeyFiles/rln/rln.wasm",
      zkeyFilePath: "js/zkeyFiles/rln/rln.zkey",
      verificationKey: "js/zkeyFiles/rln/rln.json",
      merkleProofArtifacts: {
        leaves: ["0"],
        depth: 1,
        leavesPerNode: 1,
      },
      merkleProofProvided: {
        root: "0",
        leaf: "0",
        siblings: ["0"],
        pathIndices: [0],
      },
      epoch: Date.now().toString(),
    };

    const emptyFullProof = {
      proof: {},
      publicSignals: {},
    };

    test("should generate RLN proof properly in chrome platforms", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));

      const service = InjectorService.getInstance();

      const result = await service.generateRlnProof(defaultProofRequest, { urlOrigin: mockDefaultHost });
      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith({
        method: RPCAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: { ...defaultProofRequest, urlOrigin: mockDefaultHost, identitySerialized: mockSerializedIdentity },
        meta: mockDefaultHost,
        source: "offscreen",
      });
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateRlnProof(defaultProofRequest, { urlOrigin: mockDefaultHost })).rejects.toThrow(
        "connected identity not found",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if host isn't approved", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));

      const service = InjectorService.getInstance();

      await expect(service.generateRlnProof(defaultProofRequest, { urlOrigin: "new-host" })).rejects.toThrow(
        "new-host is not approved",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should not be able to generate proof on Firefox platforms", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);

      const service = InjectorService.getInstance();

      await expect(service.generateRlnProof(defaultProofRequest, { urlOrigin: mockDefaultHost })).rejects.toThrow(
        "RLN proofs are not supported with Firefox",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });
  });
});
