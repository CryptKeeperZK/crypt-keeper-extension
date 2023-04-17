import { IdentityDecoraterService } from "@src/background/services/Identity";
import { RLNService } from "@src/background/services/Proof";

import type { RLNProofRequest, RLNFullProof } from "@src/types";

export interface IRlnGenerateArgs {
  identity: string;
  payload: RLNProofRequest;
}

export class RlnProofGenerator {
  private static INSTANCE: RlnProofGenerator;

  private rlnService: RLNService;

  private constructor() {
    this.rlnService = new RLNService();
  }

  public static getInstance(): RlnProofGenerator {
    if (!RlnProofGenerator.INSTANCE) {
      RlnProofGenerator.INSTANCE = new RlnProofGenerator();
    }

    return RlnProofGenerator.INSTANCE;
  }

  public generate({ identity, payload }: IRlnGenerateArgs): Promise<RLNFullProof> {
    return this.rlnService.genProof(IdentityDecoraterService.genFromSerialized(identity), payload);
  }
}
