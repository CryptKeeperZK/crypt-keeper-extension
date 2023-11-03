import { RPCInternalAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type {
  ICheckGroupMembershipArgs,
  IGenerateGroupMerkleProofArgs,
  IJoinGroupMemberArgs,
  IMerkleProof,
} from "@cryptkeeperzk/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

export const joinGroup =
  (payload: IJoinGroupMemberArgs, urlOrigin: string): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage({
      method: RPCInternalAction.JOIN_GROUP,
      payload,
      meta: {
        urlOrigin,
      },
    });

export const generateGroupMerkleProof =
  (payload: IGenerateGroupMerkleProofArgs, urlOrigin: string): TypedThunk<Promise<IMerkleProof>> =>
  async () =>
    postMessage({
      method: RPCInternalAction.GENERATE_GROUP_MERKLE_PROOF,
      payload,
      meta: {
        urlOrigin,
      },
    });

export const checkGroupMembership =
  (payload: ICheckGroupMembershipArgs, urlOrigin: string): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage({
      method: RPCInternalAction.CHECK_GROUP_MEMBERSHIP,
      payload,
      meta: {
        urlOrigin,
      },
    });
