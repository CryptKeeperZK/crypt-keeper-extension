import { RPCInternalAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { IUploadArgs } from "@src/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

export const downloadBackup =
  (password: string): TypedThunk<Promise<string>> =>
  async () =>
    postMessage({
      method: RPCInternalAction.DOWNLOAD_BACKUP,
      payload: password,
    });

export const createUploadBackupRequest = (): TypedThunk<Promise<void>> => async () =>
  postMessage({
    method: RPCInternalAction.REQUEST_UPLOAD_BACKUP,
  });

export const createOnboardingBackupRequest = (): TypedThunk<Promise<void>> => async () =>
  postMessage({
    method: RPCInternalAction.REQUEST_ONBOARDING_BACKUP,
  });

export const uploadBackup =
  ({ content, password, backupPassword }: IUploadArgs): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage<boolean>({
      method: RPCInternalAction.UPLOAD_BACKUP,
      payload: {
        content,
        password,
        backupPassword,
      },
    });
