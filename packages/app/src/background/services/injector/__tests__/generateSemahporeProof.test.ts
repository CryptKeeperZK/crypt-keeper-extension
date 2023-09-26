/**
 * @jest-environment jsdom
 */

import {
  PendingRequestType,
  ISemaphoreProofRequest,
  IZkMetadata,
  ConnectedIdentityMetadata,
} from "@cryptkeeperzk/types";
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
  identityStrategy: "random",
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

    test("should prepare semaphore proof properly on Chrome platform browsers", async () => {
      (pushMessage as jest.Mock).mockReturnValueOnce(emptyFullProof);
      const service = InjectorService.getInstance();

      const result = await service.generateSemaphoreProof(defaultProofRequest, defaultMetadata);

      expect(result).toStrictEqual(emptyFullProof);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith({
        method: RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
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

      await expect(service.generateSemaphoreProof(defaultProofRequest, {})).rejects.toThrowError("Origin is not set");
    });

    test("should throw error if there is no connected identity", async () => {
      mockGetConnectedIdentity.mockResolvedValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "Error: CryptKeeper: connected identity is not found",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should throw error if urlOrigin isn't approved", async () => {
      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, { urlOrigin: "new-urlOrigin" })).rejects.toThrow(
        "Error: CryptKeeper: new-urlOrigin is not approved, please do a connect request first.",
      );
      expect(pushMessage).toBeCalledTimes(0);
    });

    test("should prepare semaphore proof properly on Firefox platform browsers", async () => {
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

    test("should throw error there is no circuit and zkey files", async () => {
      mockGetConnectedIdentity.mockResolvedValue({
        serialize: () => mockSerializedIdentity,
        genIdentityCommitment: () => "mockIdentityCommitment",
      });
      (browser.runtime.getURL as jest.Mock).mockReturnValue(undefined);

      const service = InjectorService.getInstance();

      await expect(service.generateSemaphoreProof(defaultProofRequest, defaultMetadata)).rejects.toThrow(
        "Error: CryptKeeper: Must set Semaphore circuitFilePath and zkeyFilePath",
      );
    });
  });
});
