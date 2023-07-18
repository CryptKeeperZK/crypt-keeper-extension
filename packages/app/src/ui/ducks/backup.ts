import { RPCAction } from "@cryptkeeperzk/providers";

import postMessage from "@src/util/postMessage";

import type { IUploadArgs } from "@src/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

export const downloadBackup =
  (password: string): TypedThunk<Promise<string>> =>
  async () =>
    postMessage({
      method: RPCAction.DOWNLOAD_BACKUP,
      payload: password,
    });

export const uploadBackup =
  ({ content, password, backupPassword }: IUploadArgs): TypedThunk<Promise<void>> =>
  async () =>
    postMessage({
      method: RPCAction.UPLOAD_BACKUP,
      payload: {
        content,
        password,
        backupPassword,
      },
    });
