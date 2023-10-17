import { ZkIdentitySemaphore, ZkProofService } from "@cryptkeeperzk/zk";
import { Runtime } from "webextension-polyfill";

import Handler from "@src/background/controllers/handler";
import { RPCInternalAction } from "@src/constants";

import type {
  IRLNProofRequest,
  IRequestHandler,
  ISemaphoreProofRequest,
  ISemaphoreFullProof,
} from "@cryptkeeperzk/types";

const defaultMap = Object.values(RPCInternalAction).reduce(
  (acc, method) => ({ ...acc, [method]: false }),
  {},
) as unknown as Record<RPCInternalAction, boolean>;

const RPC_METHOD_ACCESS: Record<RPCInternalAction, boolean> = {
  ...defaultMap,
  [RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN]: true,
  [RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN]: true,
};

export class OffscreenController {
  private handler: Handler;

  private zkProofService: ZkProofService;

  constructor() {
    this.handler = new Handler();
    this.zkProofService = new ZkProofService();
  }

  handle = (request: IRequestHandler, sender: Runtime.MessageSender): Promise<unknown> =>
    this.handler.handle(request, { sender, bypass: RPC_METHOD_ACCESS[request.method as RPCInternalAction] });

  initialize = (): this => {
    this.handler.add(RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN, this.generateSemaphoreProof);
    this.handler.add(RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN, this.generateRlnProof);
    return this;
  };

  generateSemaphoreProof = async ({
    identitySerialized,
    externalNullifier,
    signal,
    merkleProofArtifacts,
    merkleStorageUrl,
    merkleProofProvided,
    circuitFilePath,
    zkeyFilePath,
  }: ISemaphoreProofRequest): Promise<ISemaphoreFullProof> => {
    if (!identitySerialized) {
      throw new Error("Offscreen: Serialized Identity is not set");
    }

    const identity = ZkIdentitySemaphore.genFromSerialized(identitySerialized);
    const fullProof = await this.zkProofService.generateSemaphoreProof(identity, {
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleStorageUrl,
      merkleProofProvided,
      circuitFilePath,
      zkeyFilePath,
    });

    return fullProof;
  };

  generateRlnProof = async ({
    identitySerialized,
    rlnIdentifier,
    message,
    messageId,
    messageLimit,
    epoch,
    merkleProofArtifacts,
    merkleStorageUrl,
    merkleProofProvided,
    circuitFilePath,
    zkeyFilePath,
  }: IRLNProofRequest): Promise<string> => {
    if (!identitySerialized) {
      throw new Error("Offscreen: Serialized Identity is not set");
    }

    const identity = ZkIdentitySemaphore.genFromSerialized(identitySerialized);
    const rlnFullProof = await this.zkProofService.generateRLNProof(identity, {
      rlnIdentifier,
      message,
      messageId,
      messageLimit,
      epoch,
      circuitFilePath,
      zkeyFilePath,
      merkleProofArtifacts,
      merkleStorageUrl,
      merkleProofProvided,
    });

    return JSON.stringify(rlnFullProof);
  };
}
