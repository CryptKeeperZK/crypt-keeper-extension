import { IdentityDecoraterService } from "@src/background/services/Identity";
import { SemaphoreService } from "@src/background/services/Proof";

import type { SemaphoreProof, SemaphoreProofRequest } from "@src/types";

export interface ISemaphoreGenerateArgs {
  identity: string;
  payload: SemaphoreProofRequest;
}

export class SemaphoreProofGenerator {
  private static INSTANCE: SemaphoreProofGenerator;

  private semaphoreService: SemaphoreService;

  private constructor() {
    this.semaphoreService = new SemaphoreService();
  }

  public static getInstance(): SemaphoreProofGenerator {
    if (!SemaphoreProofGenerator.INSTANCE) {
      SemaphoreProofGenerator.INSTANCE = new SemaphoreProofGenerator();
    }

    return SemaphoreProofGenerator.INSTANCE;
  }

  public generate({ identity, payload }: ISemaphoreGenerateArgs): Promise<SemaphoreProof> {
    return this.semaphoreService.genProof(IdentityDecoraterService.genFromSerialized(identity), payload);
  }
}
