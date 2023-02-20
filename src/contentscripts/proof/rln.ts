import ZkIdentityDecorater from "@src/background/identity-decorater";
import RLNService from "@src/background/services/protocols/rln";

import type { RLNFullProof } from "rlnjs";
import type { RLNProofRequest } from "@src/background/services/protocols/interfaces";

export interface IRlnGenerateArgs {
  identity: string;
  payload: RLNProofRequest;
}

export class RlnProofGenerator {
  private static INSTANCE?: RlnProofGenerator;

  private rlnService: RLNService;

  private constructor() {
    this.rlnService = new RLNService();
  }

  static getInstance(): RlnProofGenerator {
    if (!RlnProofGenerator.INSTANCE) {
      RlnProofGenerator.INSTANCE = new RlnProofGenerator();
    }

    return RlnProofGenerator.INSTANCE as RlnProofGenerator;
  }

  generate({ identity, payload }: IRlnGenerateArgs): Promise<RLNFullProof> {
    return this.rlnService.genProof(ZkIdentityDecorater.genFromSerialized(identity), payload);
  }
}
