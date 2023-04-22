import ZkIdentityDecorater from "@src/background/identityDecorater";
import ZkProofService from "@src/background/services/zkProof";
import { RLNProofRequest, RLNFullProof } from "@src/types";

export interface IRlnGenerateArgs {
  identity: string;
  payload: RLNProofRequest;
}

export class RlnProofGenerator {
  private static INSTANCE: RlnProofGenerator;

  private zkProofService: ZkProofService;

  private constructor() {
    this.rlnService = new RLNProofService();
  }

  static getInstance(): RlnProofGenerator {
    if (!RlnProofGenerator.INSTANCE) {
      RlnProofGenerator.INSTANCE = new RlnProofGenerator();
    }

    return RlnProofGenerator.INSTANCE;
  }

  generate({ identity, payload }: IRlnGenerateArgs): Promise<RLNFullProof> {
    return this.rlnService.genProof(ZkIdentityDecorater.genFromSerialized(identity), payload);
  }
}
