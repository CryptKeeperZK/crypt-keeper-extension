/**
 * @jest-environment jsdom
 */

import {
  PendingRequestType,
  ConnectedIdentityMetadata,
  IRLNProofRequest,
  ISemaphoreProofRequest,
  IZkMetadata,
} from "@cryptkeeperzk/types";
import { getMerkleProof } from "@cryptkeeperzk/zk";
import { omit } from "lodash";
import browser from "webextension-polyfill";

import { createChromeOffscreen, getBrowserPlatform } from "@src/background/shared/utils";
import { RPCInternalAction, BrowserPlatform } from "@src/constants";
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
const mockGenerateSemaphoreProof = jest.fn();
const mockGenerateRLNProof = jest.fn();
const mockGetConnectedIdentityData = jest.fn(
  (_: unknown, meta?: IZkMetadata): Promise<ConnectedIdentityMetadata | undefined> => {
    if (meta?.urlOrigin === mockDefaultUrlOrigin || meta?.urlOrigin === "new-urlOrigin") {
      return Promise.resolve(mockConnectedIdentity);
    }

    return Promise.resolve(undefined);
  },
);
const mockConnectIdentityRequest = jest.fn();
const mockIsApproved = jest.fn(
  (urlOrigin) =>
    urlOrigin === mockDefaultUrlOrigin ||
    urlOrigin === "empty_connected_identity" ||
    urlOrigin === "reject_semaphore_proof" ||
    urlOrigin === "reject_rln_proof",
);
const mockCanSkip = jest.fn((urlOrigin) => urlOrigin === mockDefaultUrlOrigin);
const mockGetStatus = jest.fn(() => Promise.resolve({ isUnlocked: false }));
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
    connectIdentityRequest: mockConnectIdentityRequest,
    awaitUnlock: mockAwaitZkIdentityServiceUnlock,
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
    (getMerkleProof as jest.Mock).mockResolvedValue({});

    mockGetConnectedIdentity.mockResolvedValue({ serialize: () => mockSerializedIdentity });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get connected identity metadata", () => {
    test("should return connected metadata properly if all checks are passed", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true });
      const service = InjectorService.getInstance();

      const result = await service.getConnectedIdentityMetadata({}, { urlOrigin: mockDefaultUrlOrigin });
      expect(result).toStrictEqual(mockConnectedIdentity);
      expect(mockIsApproved).toBeCalledTimes(1);
      expect(mockCanSkip).toBeCalledTimes(1);
      expect(mockAwaitLockServiceUnlock).toBeCalledTimes(0);
      expect(mockGetConnectedIdentityData).toBeCalledTimes(1);
    });

    test("should return undefined if extension is locked", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: false });
      const service = InjectorService.getInstance();

      const result = await service.getConnectedIdentityMetadata({}, { urlOrigin: mockDefaultUrlOrigin });
      expect(result).toStrictEqual(undefined);
      expect(mockIsApproved).toBeCalledTimes(0);
      expect(mockCanSkip).toBeCalledTimes(0);
      expect(mockAwaitLockServiceUnlock).toBeCalledTimes(0);
      expect(mockGetConnectedIdentityData).toBeCalledTimes(0);
    });

    test("should throw error if there is no urlOrigin", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true });

      const service = InjectorService.getInstance();

      await expect(service.getConnectedIdentityMetadata({}, { urlOrigin: "" })).rejects.toThrow(
        "CryptKeeper: Origin is not set",
      );
    });

    test("should send undefined  if urlOrigin isn't approved", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true });

      const service = InjectorService.getInstance();

      const result = await service.getConnectedIdentityMetadata({}, { urlOrigin: "new-urlOrigin" });

      expect(result).toStrictEqual(undefined);
    });

    test("should throw error if no connected identity found", async () => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true });

      const service = InjectorService.getInstance();

      await expect(service.getConnectedIdentityMetadata({}, { urlOrigin: "empty_connected_identity" })).rejects.toThrow(
        "CryptKeeper: identity metadata is not found",
      );
    });
  });

  describe("connect", () => {
    test("should connect properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect(defaultMetadata)).resolves.not.toThrowError();
    });

    test("should throw error if there is no urlOrigin", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ urlOrigin: "" })).rejects.toThrow("CryptKeeper: Origin is not set");
    });

    test("should connect with approval request properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ urlOrigin: "new-urlOrigin" })).resolves.not.toThrowError();
      expect(mockNewRequest).toHaveBeenCalledTimes(1);
    });

    test("should reject connect request from the approve connection page properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ urlOrigin: "reject_approve" })).rejects.toThrow(
        "CryptKeeper: error in the connect request, User rejected your request.",
      );
    });

    test("should reject connect request from the connect identity page properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.connect({ urlOrigin: "reject_connect" })).rejects.toThrow(
        "CryptKeeper: error in the connect request, User rejected your request.",
      );
    });
  });

  describe("generate Semaphore proof", () => {
    beforeEach(() => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true });
      (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const defaultProofRequest: ISemaphoreProofRequest = {
      identitySerialized: "identitySerialized",
      externalNullifier: "externalNullifier",
      signal: "signal",
      merkleProofSource: "merkleStorageUrl",
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

    test("should throw error if there is no origin url in metadata", async () => {
      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, {})).rejects.toThrowError("Origin is not set");
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: connected identity is not found",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if urlOrigin isn't approved", async () => {
      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: "new-urlOrigin" })).rejects.toThrow(
        "CryptKeeper: new-urlOrigin is not approved, please call 'connect()' request first.",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error there is no circuit and zkey files", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (browser.runtime.getURL as jest.Mock).mockReturnValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: Must set Semaphore circuitFilePath and zkeyFilePath",
      );
    });

    test("should throw error if user rejected semaphore approve request", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      const service = InjectorService.getInstance();

      await expect(
        service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: "reject_semaphore_proof" }),
      ).rejects.toThrow("CryptKeeper: error in the Semaphore approve request User rejected your request.");
    });

    test("should generate semaphore proof properly on Firefox platform browsers", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      mockGenerateSemaphoreProof.mockReturnValueOnce(emptyFullProof);
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);
      const service = InjectorService.getInstance();

      const result = await service.generateSemaphoreProof(defaultProofRequest, defaultMetadata);
      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if generate proof is failed on Firefox", async () => {
      const error = new Error("error");
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);
      mockGenerateSemaphoreProof.mockRejectedValue(error);

      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating Semaphore proof on Firefox error`,
      );
    });

    test("should generate semaphore proof properly on Chrome platform browsers", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(emptyFullProof);
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Chrome);
      const service = InjectorService.getInstance();

      const result = await service.generateSemaphoreProof(defaultProofRequest, defaultMetadata);

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith({
        method: RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultUrlOrigin,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "merkleStorageUrl",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultUrlOrigin,
        source: "offscreen",
      });
    });

    test("should throw error if generate proof is failed on Chrome platform browsers", async () => {
      const error = new Error("error");

      (pushMessage as jest.Mock).mockRejectedValueOnce(error);
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Chrome);
      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating Semaphore proof on Chrome error`,
      );
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith({
        method: RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultUrlOrigin,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "merkleStorageUrl",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultUrlOrigin,
        source: "offscreen",
      });
    });

    test("should throw error if generate proof is failed to create Chrome offscreen in Chrome platform browsers", async () => {
      const error = new Error("error");
      (pushMessage as jest.Mock).mockReturnValueOnce(emptyFullProof);
      (createChromeOffscreen as jest.Mock).mockRejectedValueOnce(error);

      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating Semaphore proof on Chrome error`,
      );

      expect(pushMessage).toBeCalledTimes(0);
    });
  });

  describe("generate RLN Proof", () => {
    beforeEach(() => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true });
      (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const defaultProofRequest: IRLNProofRequest = {
      identitySerialized: "identitySerialized",
      rlnIdentifier: "rlnIdentifier",
      message: "message",
      messageId: 0,
      messageLimit: 1,
      merkleProofSource: "merkleStorageUrl",
      circuitFilePath: "js/zkeyFiles/rln/rln.wasm",
      zkeyFilePath: "js/zkeyFiles/rln/rln.zkey",
      verificationKey: "js/zkeyFiles/rln/rln.json",
      epoch: Date.now().toString(),
    };

    const emptyFullProof = {
      proof: {},
      publicSignals: {},
    };

    test("should generate rln proof properly on Chrome platform browsers", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Chrome);
      const service = InjectorService.getInstance();

      const result = await service.generateRLNProof(defaultProofRequest, defaultMetadata);

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith({
        method: RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultUrlOrigin,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "merkleStorageUrl",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultUrlOrigin,
        source: "offscreen",
      });
    });

    test("should throw error if generate RLN proof is failed on Chrome platform browsers", async () => {
      const error = new Error("error");

      (pushMessage as jest.Mock).mockRejectedValueOnce(error);
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Chrome);
      const service = InjectorService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating RLN proof on Chrome error`,
      );
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith({
        method: RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultUrlOrigin,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "merkleStorageUrl",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultUrlOrigin,
        source: "offscreen",
      });
    });

    test("should throw error if generate proof is failed to create Chrome offscreen in Chrome platform browsers", async () => {
      const error = new Error("error");
      (pushMessage as jest.Mock).mockReturnValueOnce(emptyFullProof);
      (createChromeOffscreen as jest.Mock).mockRejectedValueOnce(error);

      const service = InjectorService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating RLN proof on Chrome error`,
      );

      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if there is no origin url in metadata", async () => {
      const service = InjectorService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, {})).rejects.toThrowError("Origin is not set");
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: connected identity is not found",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if user rejected semaphore approve request", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      const service = InjectorService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, { urlOrigin: "reject_rln_proof" })).rejects.toThrow(
        "CryptKeeper: error in the RLN approve request User rejected your request.",
      );
    });

    test("should throw error if urlOrigin isn't approved", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));

      const service = InjectorService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, { urlOrigin: "new-urlOrigin" })).rejects.toThrow(
        "new-urlOrigin is not approved",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should generate proof for firefox platform properly", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);
      mockGenerateRLNProof.mockResolvedValue(emptyFullProof);

      const service = InjectorService.getInstance();

      const result = await service.generateRLNProof(defaultProofRequest, defaultMetadata);

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if generate proof is failed", async () => {
      const error = new Error("error");
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);
      mockGenerateRLNProof.mockRejectedValue(error);

      const service = InjectorService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating RLN proof on Firefox error`,
      );
    });

    test("should throw error there is no circuit and zkey files", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (browser.runtime.getURL as jest.Mock).mockReturnValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: Must set RLN circuitFilePath and zkeyFilePath",
      );
    });
  });
});
