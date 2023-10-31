import { EventName } from "@cryptkeeperzk/providers";
import { bigintToHex } from "bigint-conversion";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import { BandadaService } from "@src/background/services/bandada";
import ConnectionService from "@src/background/services/connection";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import { Paths } from "@src/constants";
import { OperationType } from "@src/types";

import type {
  ICheckGroupMembershipArgs,
  IGenerateGroupMerkleProofArgs,
  IIdentityData,
  IJoinGroupMemberArgs,
  IMerkleProof,
  IZkMetadata,
} from "@cryptkeeperzk/types";

export default class GroupService {
  private static INSTANCE?: GroupService;

  private bandadaSevice: BandadaService;

  private connectionService: ConnectionService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private browserController: BrowserUtils;

  private constructor() {
    this.bandadaSevice = BandadaService.getInstance();
    this.connectionService = ConnectionService.getInstance();
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

  joinGroupRequest = async (
    { groupId, apiKey, inviteCode }: IJoinGroupMemberArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<void> => {
    await this.browserController.openPopup({
      params: {
        redirect: Paths.JOIN_GROUP,
        groupId,
        apiKey,
        inviteCode,
        urlOrigin,
      },
    });
  };

  joinGroup = async (
    { groupId, apiKey, inviteCode }: IJoinGroupMemberArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<boolean> => {
    const identity = this.getConnectedIdentity(urlOrigin!);

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

    await this.browserController.pushEvent({ type: EventName.JOIN_GROUP, payload: { groupId } }, { urlOrigin });

    return result;
  };

  generateGroupMerkleProofRequest = async (
    { groupId }: IGenerateGroupMerkleProofArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<void> => {
    await this.browserController.openPopup({
      params: {
        redirect: Paths.GROUP_MERKLE_PROOF,
        groupId,
        urlOrigin,
      },
    });
  };

  generateGroupMerkleProof = async (
    { groupId }: IGenerateGroupMerkleProofArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<IMerkleProof> => {
    const identity = this.getConnectedIdentity(urlOrigin!);

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
      { urlOrigin },
    );

    return merkleProof;
  };

  checkGroupMembership = async (
    { groupId }: ICheckGroupMembershipArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<boolean> => {
    const identity = this.getConnectedIdentity(urlOrigin!);

    return this.bandadaSevice.checkGroupMembership({ groupId, identity });
  };

  private getConnectedIdentity = (urlOrigin: string): IIdentityData => {
    const connectedIdenity = this.connectionService.getConnectedIdentity(urlOrigin);

    if (!connectedIdenity) {
      throw new Error("No connected identity found");
    }

    return {
      commitment: bigintToHex(connectedIdenity.genIdentityCommitment()),
      metadata: connectedIdenity.metadata,
    };
  };
}
