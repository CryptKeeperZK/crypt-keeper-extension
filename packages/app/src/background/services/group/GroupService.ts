import { BandadaService } from "@src/background/services/bandada";
import ZkIdentityService from "@src/background/services/zkIdentity";

import type { IGenerateGroupMerkleProofArgs, IJoinGroupMemberArgs, IMerkleProof } from "@cryptkeeperzk/types";

export class GroupService {
  private static INSTANCE?: GroupService;

  private bandadaSevice: BandadaService;

  private zkIdentityService: ZkIdentityService;

  private constructor() {
    this.bandadaSevice = BandadaService.getInstance();
    this.zkIdentityService = ZkIdentityService.getInstance();
  }

  static getInstance(): GroupService {
    if (!GroupService.INSTANCE) {
      GroupService.INSTANCE = new GroupService();
    }

    return GroupService.INSTANCE;
  }

  joinGroup = async ({ groupId, apiKey, inviteCode }: IJoinGroupMemberArgs): Promise<boolean> => {
    const commitment = await this.zkIdentityService.getConnectedIdentityCommitment();

    if (!commitment) {
      throw new Error("No connected identity found");
    }

    return this.bandadaSevice.addMember({ groupId, apiKey, inviteCode, commitment });
  };

  generateGroupMembershipProof = async ({ groupId }: IGenerateGroupMerkleProofArgs): Promise<IMerkleProof> => {
    const commitment = await this.zkIdentityService.getConnectedIdentityCommitment();

    if (!commitment) {
      throw new Error("No connected identity found");
    }

    return this.bandadaSevice.generateMerkleProof({ groupId, commitment });
  };
}
