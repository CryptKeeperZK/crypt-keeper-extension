import { RPCAction } from "@cryptkeeperzk/providers";

import postMessage from "@src/util/postMessage";

import type { IJoinGroupMemberArgs } from "@cryptkeeperzk/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

export const joinGroup =
  (payload: IJoinGroupMemberArgs): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage({
      method: RPCAction.JOIN_GROUP,
      payload,
    });
