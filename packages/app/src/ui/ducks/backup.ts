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

export const createUploadBackupRequest = (): TypedThunk<Promise<void>> => async () =>
  postMessage({
    method: RPCAction.REQUEST_UPLOAD_BACKUP,
  });

export const createOnboardingBackupRequest = (): TypedThunk<Promise<void>> => async () =>
  postMessage({
    method: RPCAction.REQUEST_ONBOARDING_BACKUP,
  });

export const uploadBackup =
  ({ content, password, backupPassword }: IUploadArgs): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage<boolean>({
      method: RPCAction.UPLOAD_BACKUP,
      payload: {
        content,
        password,
        backupPassword,
      },
    });
