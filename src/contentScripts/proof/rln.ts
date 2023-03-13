import ZkIdentityDecorater from "@src/background/identityDecorater";
import RLNService from "@src/background/services/protocols/rln";

import type { RLNProofRequest } from "@src/background/services/protocols/interfaces";
import type { RLNFullProof } from "rlnjs";

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
    return this.rlnService.genProof(ZkIdentityDecorater.genFromSerialized(identity), payload);
  }
}
