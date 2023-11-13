/**
 * @jest-environment jsdom
 */

import { PendingRequestType, type IRLNProofRequest, type ISemaphoreProofRequest } from "@cryptkeeperzk/types";
import { getMerkleProof } from "@cryptkeeperzk/zk";
import omit from "lodash/omit";
import browser from "webextension-polyfill";

import { createChromeOffscreen, getBrowserPlatform } from "@src/background/shared/utils";
import { RPCInternalAction, BrowserPlatform } from "@src/constants";
import pushMessage from "@src/util/pushMessage";

import ProtocolService from "..";

const mockDefaultUrlOrigin = "http://localhost:3000";
const mockSerializedIdentity = "identity";

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
  ZkProofService: {
    getInstance: jest.fn(() => ({
      generateSemaphoreProof: mockGenerateSemaphoreProof,
      generateRLNProof: mockGenerateRLNProof,
    })),
  },
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
    newRequest: jest.fn((type: PendingRequestType, { urlOrigin }: { urlOrigin: string }): Promise<unknown> => {
      if (urlOrigin.includes("reject")) {
        return Promise.reject(new Error("User rejected your request."));
      }

      if (type === PendingRequestType.APPROVE) {
        return Promise.resolve({ urlOrigin, canSkipApprove: false });
      }

      return Promise.resolve();
    }),
  })),
}));

jest.mock("@src/background/services/approval", (): unknown => ({
  getInstance: jest.fn(() => ({
    canSkipApprove: jest.fn(() => false),
  })),
}));

jest.mock("@src/background/services/connection", (): unknown => ({
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

describe("background/services/protocol", () => {
  const defaultMetadata = { urlOrigin: mockDefaultUrlOrigin };

  const emptyFullProof = {
    fullProof: {
      proof: {},
      publicSignals: {},
    },
  };

  beforeEach(() => {
    (getMerkleProof as jest.Mock).mockResolvedValue({});

    (pushMessage as jest.Mock).mockResolvedValue(emptyFullProof);

    (getBrowserPlatform as jest.Mock).mockReturnValue(BrowserPlatform.Chrome);

    (createChromeOffscreen as jest.Mock).mockResolvedValue(undefined);

    (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);

    mockGenerateSemaphoreProof.mockResolvedValue(emptyFullProof);

    mockGenerateRLNProof.mockResolvedValue(emptyFullProof);

    mockGetConnectedIdentity.mockReturnValue({ serialize: () => mockSerializedIdentity });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generate semaphore proof", () => {
    const defaultProofRequest: ISemaphoreProofRequest = {
      identitySerialized: "identitySerialized",
      externalNullifier: "externalNullifier",
      signal: "signal",
      merkleProofSource: "https://merklestorageurl.com",
      circuitFilePath: "js/zkeyFiles/semaphore/semaphore.wasm",
      zkeyFilePath: "js/zkeyFiles/semaphore/semaphore.zkey",
      verificationKey: "js/zkeyFiles/semaphore/semaphore.json",
    };

    test("should throw error if there is no origin url in metadata", async () => {
      const service = ProtocolService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, {})).rejects.toThrowError("Origin is not set");
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockReturnValue(undefined);

      const service = ProtocolService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: connected identity is not found",
      );
      expect(pushMessage).toHaveBeenCalledTimes(0);
    });

    test("should throw error there is no circuit and zkey files", async () => {
      mockGetConnectedIdentity.mockReturnValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (browser.runtime.getURL as jest.Mock).mockReturnValue(undefined);

      const service = ProtocolService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: Must set Semaphore circuitFilePath and zkeyFilePath",
      );
    });

    test("should throw error if user rejected semaphore approve request", async () => {
      mockGetConnectedIdentity.mockReturnValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      const service = ProtocolService.getInstance();

      await expect(
        service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: "reject_semaphore_proof" }),
      ).rejects.toThrow("CryptKeeper: Error in generating Semaphore proof User rejected your request.");
    });

    test("should generate semaphore proof properly on firefox platform browsers", async () => {
      mockGetConnectedIdentity.mockReturnValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (getBrowserPlatform as jest.Mock).mockReturnValue(BrowserPlatform.Firefox);
      const service = ProtocolService.getInstance();

      const result = await service.generateSemaphoreProof(defaultProofRequest, defaultMetadata);
      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toHaveBeenCalledTimes(0);
    });

    test("should throw error if generate proof is failed on firefox", async () => {
      const error = new Error("error");
      (getBrowserPlatform as jest.Mock).mockReturnValue(BrowserPlatform.Firefox);
      mockGenerateSemaphoreProof.mockRejectedValue(error);

      const service = ProtocolService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating Semaphore proof error`,
      );
    });

    test("should generate semaphore proof properly on chrome platform browsers", async () => {
      const service = ProtocolService.getInstance();

      const result = await service.generateSemaphoreProof(defaultProofRequest, defaultMetadata);

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toHaveBeenCalledTimes(1);
      expect(pushMessage).toHaveBeenCalledWith({
        method: RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultUrlOrigin,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "https://merklestorageurl.com",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultUrlOrigin,
        source: "offscreen",
      });
    });

    test("should throw error if generate proof is failed on chrome platform browsers", async () => {
      const error = new Error("error");
      (pushMessage as jest.Mock).mockRejectedValue(error);
      const service = ProtocolService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating Semaphore proof error`,
      );
      expect(pushMessage).toHaveBeenCalledTimes(1);
      expect(pushMessage).toHaveBeenCalledWith({
        method: RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultUrlOrigin,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "https://merklestorageurl.com",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultUrlOrigin,
        source: "offscreen",
      });
    });

    test("should throw error if generate proof is failed to create chrome offscreen in chrome platform browsers", async () => {
      const error = new Error("error");
      (createChromeOffscreen as jest.Mock).mockRejectedValue(error);

      const service = ProtocolService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating Semaphore proof error`,
      );

      expect(pushMessage).toHaveBeenCalledTimes(0);
    });
  });

  describe("generate rln proof", () => {
    const defaultProofRequest: IRLNProofRequest = {
      identitySerialized: "identitySerialized",
      rlnIdentifier: "rlnIdentifier",
      message: "message",
      messageId: 0,
      messageLimit: 1,
      merkleProofSource: "https://merklestorageurl.com",
      circuitFilePath: "js/zkeyFiles/rln/rln.wasm",
      zkeyFilePath: "js/zkeyFiles/rln/rln.zkey",
      verificationKey: "js/zkeyFiles/rln/rln.json",
      epoch: Date.now().toString(),
    };

    test("should generate rln proof properly on chrome platform browsers", async () => {
      const service = ProtocolService.getInstance();

      const result = await service.generateRLNProof(defaultProofRequest, defaultMetadata);

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toHaveBeenCalledTimes(1);
      expect(pushMessage).toHaveBeenCalledWith({
        method: RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultUrlOrigin,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "https://merklestorageurl.com",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultUrlOrigin,
        source: "offscreen",
      });
    });

    test("should throw error if generate rln proof is failed on chrome platform browsers", async () => {
      const error = new Error("error");
      (pushMessage as jest.Mock).mockRejectedValue(error);
      const service = ProtocolService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating RLN proof error`,
      );
      expect(pushMessage).toHaveBeenCalledTimes(1);
      expect(pushMessage).toHaveBeenCalledWith({
        method: RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultUrlOrigin,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "https://merklestorageurl.com",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultUrlOrigin,
        source: "offscreen",
      });
    });

    test("should throw error if generate proof is failed to create chrome offscreen in chrome platform browsers", async () => {
      const error = new Error("error");
      (createChromeOffscreen as jest.Mock).mockRejectedValue(error);
      const service = ProtocolService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating RLN proof error`,
      );

      expect(pushMessage).toHaveBeenCalledTimes(0);
    });

    test("should throw error if there is no origin url in metadata", async () => {
      const service = ProtocolService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, {})).rejects.toThrowError("Origin is not set");
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockReturnValue(undefined);

      const service = ProtocolService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: connected identity is not found",
      );
      expect(pushMessage).toHaveBeenCalledTimes(0);
    });

    test("should throw error if user rejected semaphore approve request", async () => {
      mockGetConnectedIdentity.mockReturnValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      const service = ProtocolService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, { urlOrigin: "reject_rln_proof" })).rejects.toThrow(
        "CryptKeeper: Error in generating RLN proof User rejected your request.",
      );
    });

    test("should generate proof for firefox platform properly", async () => {
      (getBrowserPlatform as jest.Mock).mockReturnValue(BrowserPlatform.Firefox);

      const service = ProtocolService.getInstance();

      const result = await service.generateRLNProof(defaultProofRequest, defaultMetadata);

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toHaveBeenCalledTimes(0);
    });

    test("should throw error if generate proof is failed", async () => {
      const error = new Error("error");
      (getBrowserPlatform as jest.Mock).mockReturnValue(BrowserPlatform.Firefox);
      mockGenerateRLNProof.mockRejectedValue(error);

      const service = ProtocolService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `CryptKeeper: Error in generating RLN proof error`,
      );
    });

    test("should throw error there is no circuit and zkey files", async () => {
      mockGetConnectedIdentity.mockReturnValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (browser.runtime.getURL as jest.Mock).mockReturnValue(undefined);

      const service = ProtocolService.getInstance();

      await expect(service.generateRLNProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: Must set RLN circuitFilePath and zkeyFilePath",
      );
    });
  });
});
