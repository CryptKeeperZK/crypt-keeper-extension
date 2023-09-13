import { RPCAction } from "@cryptkeeperzk/providers";

import postMessage from "@src/util/postMessage";

import type {
  ICheckGroupMembershipArgs,
  IGenerateGroupMerkleProofArgs,
  IJoinGroupMemberArgs,
  IMerkleProof,
} from "@cryptkeeperzk/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

export const joinGroup =
  (payload: IJoinGroupMemberArgs): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage({
      method: RPCAction.JOIN_GROUP,
      payload,
    });

export const generateGroupMerkleProof =
  (payload: IGenerateGroupMerkleProofArgs): TypedThunk<Promise<IMerkleProof>> =>
  async () =>
    postMessage({
      method: RPCAction.GENERATE_GROUP_MERKLE_PROOF,
      payload,
    });

export const checkGroupMembership =
  (payload: ICheckGroupMembershipArgs): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage({
      method: RPCAction.CHECK_GROUP_MEMBERSHIP,
      payload,
    });
