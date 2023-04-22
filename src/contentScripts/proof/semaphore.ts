import ZkIdentityDecorater from "@src/background/identityDecorater";
import { SemaphoreProofService } from "@src/background/services/zkProof";
import { SemaphoreProofRequest, SemaphoreProof } from "@src/types";

export interface ISemaphoreGenerateArgs {
  identity: string;
  payload: SemaphoreProofRequest;
}

export class SemaphoreProofGenerator {
  private static INSTANCE: SemaphoreProofGenerator;

  private semaphoreService: SemaphoreProofService;

  private constructor() {
    this.semaphoreService = new SemaphoreProofService();
  }

  static getInstance(): SemaphoreProofGenerator {
    if (!SemaphoreProofGenerator.INSTANCE) {
      SemaphoreProofGenerator.INSTANCE = new SemaphoreProofGenerator();
    }

    return SemaphoreProofGenerator.INSTANCE;
  }

  generate({ identity, payload }: ISemaphoreGenerateArgs): Promise<SemaphoreProof> {
    return this.semaphoreService.genProof(ZkIdentityDecorater.genFromSerialized(identity), payload);
  }
}
