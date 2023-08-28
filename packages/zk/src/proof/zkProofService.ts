import { ZkIdentitySemaphore } from "@src/identity";

import type {
  IRLNProofRequest,
  IRLNSNARKProof,
  ISemaphoreFullProof,
  ISemaphoreProofRequest,
} from "@cryptkeeperzk/types";

import { RLNProofService, SemaphoreProofService } from "./protocols";

export class ZkProofService {
  private static INSTANCE?: ZkProofService;

  private semaphoreProofService: SemaphoreProofService;

  private rlnProofService: RLNProofService;

  constructor() {
    this.semaphoreProofService = new SemaphoreProofService();
    this.rlnProofService = new RLNProofService();
  }

  static getInstance(): ZkProofService {
    if (!ZkProofService.INSTANCE) {
      ZkProofService.INSTANCE = new ZkProofService();
    }

    return ZkProofService.INSTANCE;
  }

  /**
   * Generates a Semaphore proof for the provided identity and request.
   *
   * @param {ZkIdentitySemaphore} identity - The identity for theISemaphoreProofRequest
   * @param {SemaphoreProofRequest} semaphoreProofRequest - The request data for the proof generation.
   * @returns {Promise<SemaphoreFullProof>} A Promise that resolves to the generated Semaphore proof.
   */
  generateSemaphoreProof(
    identity: ZkIdentitySemaphore,
    {
      circuitFilePath,
      zkeyFilePath,
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleStorageAddress,
      merkleProofProvided,
    }: ISemaphoreProofRequest,
  ): Promise<ISemaphoreFullProof> {
    return this.semaphoreProofService.genProof(identity, {
      circuitFilePath,
      zkeyFilePath,
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleStorageAddress,
      merkleProofProvided,
    });
  }

  /**
   * Generates an RLN (Reputation Linked-Note) proof for the provided identity and request.
   *
   * @param {ZkIdentitySemaphore} identity - The identity for the RLN proof.
   * @param {IRlnProofRequest} rlnProofRequest - The request data for the RLN proof generation.
   * @returns {Promise<RLNFullProof>} A Promise that resolves to the generated RLN proof.
   */
  generateRLNProof(
    identity: ZkIdentitySemaphore,
    {
      rlnIdentifier,
      message,
      messageId,
      messageLimit,
      epoch,
      circuitFilePath,
      zkeyFilePath,
      merkleProofArtifacts,
      merkleStorageAddress,
      merkleProofProvided,
    }: IRLNProofRequest,
  ): Promise<IRLNSNARKProof> {
    return this.rlnProofService.genProof(identity, {
      rlnIdentifier,
      message,
      messageId,
      messageLimit,
      epoch,
      circuitFilePath,
      zkeyFilePath,
      merkleProofArtifacts,
      merkleStorageAddress,
      merkleProofProvided,
    });
  }
}
