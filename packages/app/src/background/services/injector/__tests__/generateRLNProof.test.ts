/**
 * @jest-environment jsdom
 */

import { PendingRequestType, IRLNProofRequest, IZkMetadata, ConnectedIdentityMetadata } from "@cryptkeeperzk/types";
import { getMerkleProof } from "@cryptkeeperzk/zk";
import { omit } from "lodash";
import browser from "webextension-polyfill";

import { getBrowserPlatform } from "@src/background/shared/utils";
import { BrowserPlatform, RPCInternalAction } from "@src/constants";
import pushMessage from "@src/util/pushMessage";

import InjectorService from "..";

const mockDefaultHost = "http://localhost:3000";
const mockSerializedIdentity = "identity";
const mockConnectedIdentity: ConnectedIdentityMetadata = {
  name: "Account 1",
};
const mockNewRequest = jest.fn((_: PendingRequestType, meta: IZkMetadata) =>
  meta.urlOrigin === "reject" ? Promise.reject() : Promise.resolve(),
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

  describe("rln", () => {
    beforeEach(() => {
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

    test("should generate RLN proof properly in chrome platforms", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));

      const service = InjectorService.getInstance();

      const result = await service.generateRlnProof(defaultProofRequest, defaultMetadata);
      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith({
        method: RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: {
          ...omit(defaultProofRequest, ["merkleProofSource"]),
          urlOrigin: mockDefaultHost,
          identitySerialized: mockSerializedIdentity,
          merkleStorageUrl: "merkleStorageUrl",
          merkleProofArtifacts: undefined,
          merkleProofProvided: undefined,
        },
        meta: mockDefaultHost,
        source: "offscreen",
      });
    });

    test("should throw error if there is no origin url in metadata", async () => {
      const service = InjectorService.getInstance();

      await expect(service.generateRlnProof(defaultProofRequest, {})).rejects.toThrowError("Origin is not set");
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateRlnProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "Error: CryptKeeper: connected identity is not found",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if urlOrigin isn't approved", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));

      const service = InjectorService.getInstance();

      await expect(service.generateRlnProof(defaultProofRequest, { urlOrigin: "new-urlOrigin" })).rejects.toThrow(
        "new-urlOrigin is not approved",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should generate proof for firefox platform properly", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);
      mockGenerateRLNProof.mockResolvedValue(emptyFullProof);

      const service = InjectorService.getInstance();

      const result = await service.generateRlnProof(defaultProofRequest, defaultMetadata);

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if generate proof is failed", async () => {
      const error = new Error("error");
      (pushMessage as jest.Mock).mockReturnValueOnce(JSON.stringify(emptyFullProof));
      (getBrowserPlatform as jest.Mock).mockReturnValueOnce(BrowserPlatform.Firefox);
      mockGenerateRLNProof.mockRejectedValue(error);

      const service = InjectorService.getInstance();

      await expect(service.generateRlnProof(defaultProofRequest, defaultMetadata)).rejects.toThrowError(
        `Error: CryptKeeper: Error in generating RLN proof on Firefox Error: error`,
      );
    });

    test("should throw error there is no circuit and zkey files", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (browser.runtime.getURL as jest.Mock).mockReturnValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateRlnProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "Error: CryptKeeper: Must set RLN circuitFilePath and zkeyFilePath",
      );
    });
  });
});
