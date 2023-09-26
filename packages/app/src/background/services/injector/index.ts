import {
  PendingRequestType,
  IRLNProofRequest,
  ISemaphoreFullProof,
  ISemaphoreProofRequest,
  IZkMetadata,
  IRLNFullProof,
  ConnectedIdentityMetadata,
  IHostPermission,
} from "@cryptkeeperzk/types";
import omit from "lodash/omit";
import browser from "webextension-polyfill";

import { throwErrorProperly } from "@src/background/shared/utils";

import { InjectorHandler } from "./InjectorHandler";

export default class InjectorService extends InjectorHandler {
  private static INSTANCE?: InjectorService;

  private constructor() {
    super();
  }

  static getInstance(): InjectorService {
    if (!InjectorService.INSTANCE) {
      InjectorService.INSTANCE = new InjectorService();
    }

    return InjectorService.INSTANCE;
  }

  getConnectedIdentityMetadata = async (_: unknown, meta?: IZkMetadata): Promise<ConnectedIdentityMetadata> => {
    try {
      await this.requiredApproval({ urlOrigin: meta?.urlOrigin });
      return this.connectedIdentityMetadata({}, meta);
    } catch (error) {
      throw new Error(error as string);
    }
  };

  connectIdentity = async ({ urlOrigin }: IZkMetadata): Promise<ConnectedIdentityMetadata> => {
    try {
      const { checkedUrlOrigin, isApproved, canSkipApprove } = await this.checkApproval({ urlOrigin });

      if (isApproved) {
        await this.approvalService.add({ urlOrigin: checkedUrlOrigin, canSkipApprove });
      } else {
        try {
          const hostPermissionChecks = (await this.newRequest(PendingRequestType.APPROVE, {
            urlOrigin,
          })) as IHostPermission;
          await this.approvalService.add({
            urlOrigin: hostPermissionChecks.urlOrigin,
            canSkipApprove: hostPermissionChecks.canSkipApprove,
          });
        } catch (error) {
          throwErrorProperly(error, "CryptKeeper: error in the approve request");
        }
      }

      try {
        await this.newRequest(PendingRequestType.CONNECT_IDENTITY, { urlOrigin });
      } catch (error) {
        throw new Error(`CryptKeeper: error in the connect request ${error as string}`);
      }

      const connectedIdentity = await this.zkIdentityService.getConnectedIdentityData({}, { urlOrigin });

      if (!connectedIdentity) {
        throw new Error("CryptKeeper: failed to connect with an identity");
      }

      return connectedIdentity;
    } catch (error) {
      throw new Error(error as string);
    } finally {
      await this.browserService.closePopup();
    }
  };

  generateSemaphoreProof = async (
    { externalNullifier, signal, merkleProofSource }: ISemaphoreProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<ISemaphoreFullProof> => {
    try {
      const { checkedUrlOrigin, canSkipApprove } = await this.requiredApproval({ urlOrigin });

      const checkedZkInputs = this.checkMerkleProofSource({
        merkleProofSource,
      });

      const identity = await this.zkIdentityService.getConnectedIdentity();
      const identitySerialized = identity?.serialize();

      if (!identity || !identitySerialized) {
        throw new Error("CryptKeeper: connected identity is not found");
      }

      const semaphorePath = {
        circuitFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.wasm"),
        zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.zkey"),
        verificationKey: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.json"),
      };

      const semaphoreRequest: ISemaphoreProofRequest = {
        externalNullifier,
        signal,
        merkleProofProvided: checkedZkInputs.merkleProofProvided,
        merkleProofArtifacts: checkedZkInputs.merkleProofArtifacts,
        merkleStorageUrl: checkedZkInputs.merkleStorageUrl,
        identitySerialized,
        circuitFilePath: semaphorePath.circuitFilePath,
        zkeyFilePath: semaphorePath.zkeyFilePath,
        verificationKey: semaphorePath.verificationKey,
        urlOrigin: checkedUrlOrigin,
      };

      if (!canSkipApprove) {
        const request = omit(semaphoreRequest, ["identitySerialized"]);

        await this.newRequest(PendingRequestType.SEMAPHORE_PROOF, request);
      }

      const fullProof = await this.computeSemaphoreProof(identity, semaphoreRequest);

      return fullProof;
    } catch (error) {
      throw new Error(error as string);
    }
  };

  generateRlnProof = async (
    { rlnIdentifier, message, epoch, messageLimit, messageId, merkleProofSource }: IRLNProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<IRLNFullProof> => {
    try {
      const { checkedUrlOrigin, canSkipApprove } = await this.requiredApproval({ urlOrigin });

      const checkedZkInputs = this.checkMerkleProofSource({
        merkleProofSource,
      });

      const identity = await this.zkIdentityService.getConnectedIdentity();
      const identitySerialized = identity?.serialize();

      if (!identity || !identitySerialized) {
        throw new Error("CryptKeeper: connected identity is not found");
      }

      const rlnPath = {
        circuitFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.wasm"),
        zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.zkey"),
        verificationKey: browser.runtime.getURL("js/zkeyFiles/rln/rln.json"),
      };

      const rlnProofRequest: IRLNProofRequest = {
        rlnIdentifier,
        message,
        epoch,
        merkleProofProvided: checkedZkInputs.merkleProofProvided,
        merkleProofArtifacts: checkedZkInputs.merkleProofArtifacts,
        merkleStorageUrl: checkedZkInputs.merkleStorageUrl,
        messageLimit,
        messageId,
        identitySerialized,
        circuitFilePath: rlnPath.circuitFilePath,
        zkeyFilePath: rlnPath.zkeyFilePath,
        verificationKey: rlnPath.verificationKey,
        urlOrigin: checkedUrlOrigin,
      };

      if (!canSkipApprove) {
        const request = omit(rlnProofRequest, ["identitySerialized"]);

        await this.newRequest(PendingRequestType.RLN_PROOF, request);
      }

      const fullProof = await this.computeRlnProof(identity, rlnProofRequest);

      return fullProof;
    } catch (error) {
      throw new Error(error as string);
    }
  };
}
