import { EventName } from "@cryptkeeperzk/providers";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import { BandadaService } from "@src/background/services/bandada";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { Paths } from "@src/constants";
import { OperationType } from "@src/types";

import type {
  ICheckGroupMembershipArgs,
  IGenerateGroupMerkleProofArgs,
  IIdentityData,
  IJoinGroupMemberArgs,
  IMerkleProof,
} from "@cryptkeeperzk/types";

export class GroupService {
  private static INSTANCE?: GroupService;

  private bandadaSevice: BandadaService;

  private zkIdentityService: ZkIdentityService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private browserController: BrowserUtils;

  private constructor() {
    this.bandadaSevice = BandadaService.getInstance();
    this.zkIdentityService = ZkIdentityService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.browserController = BrowserUtils.getInstance();
  }

  static getInstance(): GroupService {
    if (!GroupService.INSTANCE) {
      GroupService.INSTANCE = new GroupService();
    }

    return GroupService.INSTANCE;
  }

  joinGroupRequest = async ({ groupId, apiKey, inviteCode }: IJoinGroupMemberArgs): Promise<void> => {
    await this.browserController.openPopup({
      params: {
        redirect: Paths.JOIN_GROUP,
        groupId,
        apiKey: apiKey ?? "",
        inviteCode: inviteCode ?? "",
      },
    });
  };

  joinGroup = async ({ groupId, apiKey, inviteCode }: IJoinGroupMemberArgs): Promise<boolean> => {
    const identity = await this.getConnectedIdentity();

    const result = await this.bandadaSevice.addMember({ groupId, apiKey, inviteCode, identity });

    await this.historyService.trackOperation(OperationType.JOIN_GROUP, { identity, group: { id: groupId } });
    await this.notificationService.create({
      options: {
        title: "Joined group",
        message: "You've been successfully joined the group",
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    await this.browserController.pushEvent(
      { type: EventName.JOIN_GROUP, payload: { groupId } },
      { urlOrigin: identity.metadata.host! },
    );

    return result;
  };

  generateGroupMerkleProofRequest = async ({ groupId }: IGenerateGroupMerkleProofArgs): Promise<void> => {
    await this.browserController.openPopup({
      params: {
        redirect: Paths.GROUP_MERKLE_PROOF,
        groupId,
      },
    });
  };

  generateGroupMerkleProof = async ({ groupId }: IGenerateGroupMerkleProofArgs): Promise<IMerkleProof> => {
    const identity = await this.getConnectedIdentity();

    const merkleProof = await this.bandadaSevice.generateMerkleProof({ groupId, identity });

    await this.notificationService.create({
      options: {
        title: "Generated Group Merkle Proof",
        message: "You've been successfully generated Group Merkle Proof",
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    await this.browserController.pushEvent(
      { type: EventName.GROUP_MERKLE_PROOF, payload: { merkleProof } },
      { urlOrigin: identity.metadata.host! },
    );

    return merkleProof;
  };

  checkGroupMembership = async ({ groupId }: ICheckGroupMembershipArgs): Promise<boolean> => {
    const identity = await this.getConnectedIdentity();

    return this.bandadaSevice.checkGroupMembership({ groupId, identity });
  };

  private getConnectedIdentity = async (): Promise<IIdentityData> => {
    const [commitment, identity] = await Promise.all([
      this.zkIdentityService.getConnectedIdentityCommitment(),
      this.zkIdentityService.getConnectedIdentity(),
    ]);

    if (!commitment || !identity) {
      throw new Error("No connected identity found");
    }

    return {
      commitment,
      metadata: identity.metadata,
    };
  };
}
