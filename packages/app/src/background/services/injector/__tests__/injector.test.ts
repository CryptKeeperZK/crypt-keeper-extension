/**
 * @jest-environment jsdom
 */

import {
  PendingRequestType,
  ConnectedIdentityMetadata,
  IRLNProofRequest,
  ISemaphoreProofRequest,
  IZkMetadata,
  IJoinGroupMemberArgs,
  IGenerateGroupMerkleProofArgs,
} from "@cryptkeeperzk/types";
import { getMerkleProof } from "@cryptkeeperzk/zk";
import { omit } from "lodash";
import browser from "webextension-polyfill";

import { createChromeOffscreen, getBrowserPlatform } from "@src/background/shared/utils";
import { mockDefaultIdentity } from "@src/config/mock/zk";
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
      return Promise.resolve({ ...mockConnectedIdentity, ...meta });
    }

    if (meta?.urlOrigin === "unknown") {
      return Promise.resolve({ ...mockConnectedIdentity, urlOrigin: undefined });
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

const mockJoinGroupRequest = jest.fn();
const mockGenerateGroupProofRequest = jest.fn();

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

jest.mock("@src/background/services/group", (): unknown => ({
  getInstance: jest.fn(() => ({
    joinGroupRequest: mockJoinGroupRequest,
    generateGroupMerkleProofRequest: mockGenerateGroupProofRequest,
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
    (getMerkleProof as jest.Mock).mockResolvedValue({});

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

    test("should send undefined if urlOrigin isn't approved", async () => {
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
    test("should check if origin is approved properly", () => {
      const service = InjectorService.getInstance();

      const result = service.isApproved({}, { urlOrigin: mockDefaultUrlOrigin });

      expect(result).toStrictEqual({});
    });

    test("should throw error if origin is not approved", () => {
      const service = InjectorService.getInstance();

      expect(() => service.isApproved({}, { urlOrigin: "unknown" })).toThrowError(
        "CryptKeeper: Origin is not approved",
      );
    });

    test("should check if origin is connected properly", async () => {
      const service = InjectorService.getInstance();

      const result = await service.isConnected({}, { urlOrigin: mockDefaultUrlOrigin });

      expect(result).toStrictEqual({});
    });

    test("should throw error if origin is not connected", async () => {
      const service = InjectorService.getInstance();

      await expect(service.isConnected({}, { urlOrigin: "unknown" })).rejects.toThrowError(
        "CryptKeeper: Origin is not connected",
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

  describe("generate Semaphore proof", () => {
    beforeEach(() => {
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true, isInitialized: true });
      (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const defaultProofRequest: ISemaphoreProofRequest = {
      identitySerialized: "identitySerialized",
      externalNullifier: "externalNullifier",
      signal: "signal",
      merkleProofSource: "https://merklestorageurl.com",
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
          merkleStorageUrl: "https://merklestorageurl.com",
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
          merkleStorageUrl: "https://merklestorageurl.com",
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
      mockGetStatus.mockResolvedValueOnce({ isUnlocked: true, isInitialized: true });
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
      merkleProofSource: "https://merklestorageurl.com",
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
          merkleStorageUrl: "https://merklestorageurl.com",
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
          merkleStorageUrl: "https://merklestorageurl.com",
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
        "CryptKeeper: new-urlOrigin is not approved, please call 'connect()' request first.",
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

  describe("Join Group", () => {
    const defaultArgs: IJoinGroupMemberArgs = {
      groupId: "90694543209366256629502773954857",
      apiKey: "api-key",
    };

    beforeEach(() => {
      (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should request group joining properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.joinGroup(defaultArgs, defaultMetadata)).resolves.toBeUndefined();
      await expect(service.joinGroup({ groupId: defaultArgs.groupId }, defaultMetadata)).resolves.toBeUndefined();
    });

    test("should reject request group joining if urlOrigin isn't approved", async () => {
      const service = InjectorService.getInstance();

      await expect(service.joinGroup(defaultArgs, { urlOrigin: "new-urlOrigin" })).rejects.toThrow(
        "CryptKeeper: new-urlOrigin is not approved, please call 'connect()' request first.",
      );
      await expect(service.joinGroup({ groupId: defaultArgs.groupId }, { urlOrigin: "new-urlOrigin" })).rejects.toThrow(
        "CryptKeeper: new-urlOrigin is not approved, please call 'connect()' request first.",
      );
    });

    test("should reject connect request from the approve connection page properly", async () => {
      const error = new Error("User rejected your request.");
      mockJoinGroupRequest.mockRejectedValue(error);

      const service = InjectorService.getInstance();

      await expect(service.joinGroup(defaultArgs, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: joining a group via Bandada service User rejected your request.",
      );
      await expect(service.joinGroup({ groupId: defaultArgs.groupId }, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: joining a group via Bandada service User rejected your request.",
      );
    });
  });

  describe("Generate Group Merkle Proof", () => {
    const defaultArgs: IGenerateGroupMerkleProofArgs = {
      groupId: "90694543209366256629502773954857",
    };

    beforeEach(() => {
      (browser.runtime.getURL as jest.Mock).mockImplementation((path: string) => path);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should request group joining properly", async () => {
      const service = InjectorService.getInstance();

      await expect(service.generateGroupMerkleProof(defaultArgs, defaultMetadata)).resolves.toBeUndefined();
      await expect(
        service.generateGroupMerkleProof({ groupId: defaultArgs.groupId }, defaultMetadata),
      ).resolves.toBeUndefined();
    });

    test("should reject request group joining if urlOrigin isn't approved", async () => {
      const service = InjectorService.getInstance();

      await expect(service.generateGroupMerkleProof(defaultArgs, { urlOrigin: "new-urlOrigin" })).rejects.toThrow(
        "CryptKeeper: new-urlOrigin is not approved, please call 'connect()' request first.",
      );
      await expect(
        service.generateGroupMerkleProof({ groupId: defaultArgs.groupId }, { urlOrigin: "new-urlOrigin" }),
      ).rejects.toThrow("CryptKeeper: new-urlOrigin is not approved, please call 'connect()' request first.");
    });

    test("should reject connect request from the approve connection page properly", async () => {
      const error = new Error("User rejected your request.");
      mockGenerateGroupProofRequest.mockRejectedValue(error);

      const service = InjectorService.getInstance();

      await expect(service.generateGroupMerkleProof(defaultArgs, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: generate Merkle Proof via Bandada service User rejected your request.",
      );
      await expect(service.generateGroupMerkleProof({ groupId: defaultArgs.groupId }, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: generate Merkle Proof via Bandada service User rejected your request.",
      );
    });
  });
});
