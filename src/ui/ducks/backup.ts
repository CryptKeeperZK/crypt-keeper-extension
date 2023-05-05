import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

export const downloadBackup =
  (password: string): TypedThunk<Promise<string>> =>
  async () =>
    postMessage({
      method: RPCAction.DOWNLOAD_BACKUP,
      payload: password,
    });
