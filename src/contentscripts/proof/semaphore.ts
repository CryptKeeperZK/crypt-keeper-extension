import ZkIdentityDecorater from "@src/background/identity-decorater";
import SemaphoreService from "@src/background/services/protocols/semaphore";

import type { SemaphoreProof, SemaphoreProofRequest } from "@src/background/services/protocols/interfaces";

export interface ISemaphoreGenerateArgs {
  identity: string;
  payload: SemaphoreProofRequest;
}

export class SemaphoreProofGenerator {
  private static INSTANCE?: SemaphoreProofGenerator;

  private semaphoreService: SemaphoreService;

  private constructor() {
    this.semaphoreService = new SemaphoreService();
  }

  static getInstance(): SemaphoreProofGenerator {
    if (!SemaphoreProofGenerator.INSTANCE) {
      SemaphoreProofGenerator.INSTANCE = new SemaphoreProofGenerator();
    }

    return SemaphoreProofGenerator.INSTANCE as SemaphoreProofGenerator;
  }

  generate({ identity, payload }: ISemaphoreGenerateArgs): Promise<SemaphoreProof> {
    return this.semaphoreService.genProof(ZkIdentityDecorater.genFromSerialized(identity), payload);
  }
}
