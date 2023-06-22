import type { IdentityData } from "@cryptkeeperzk/types";

export enum OperationType {
  CREATE_IDENTITY = "CREATE_IDENTITY",
  DELETE_IDENTITY = "DELETE_IDENTITY",
  DELETE_ALL_IDENTITIES = "DELETE_ALL_IDENTITIES",
  DOWNLOAD_BACKUP = "DOWNLOAD_BACKUP",
  UPLOAD_BACKUP = "UPLOAD_BACKUP",
  RESET_PASSWORD = "RESET_PASSWORD",
  ADD_VERIFIABLE_CREDENTIAL = "ADD_VERIFIABLE_CREDENTIAL",
<<<<<<< HEAD
  DELETE_VERIFIABLE_CREDENTIAL = "DELETE_VERIFIABLE_CREDENTIAL",
  DELETE_ALL_VERIFIABLE_CREDENTIALS = "DELETE_ALL_VERIFIABLE_CREDENTIALS",
=======
>>>>>>> 6cc5e46 (fix: merge conflicts (#492))
}

export interface Operation {
  id: string;
  type: OperationType;
  identity?: IdentityData;
  createdAt: string;
}

export interface HistorySettings {
  isEnabled: boolean;
}
