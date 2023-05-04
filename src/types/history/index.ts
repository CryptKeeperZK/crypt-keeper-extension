import { IdentityData } from "../identity";

export enum OperationType {
  CREATE_IDENTITY = "CREATE_IDENTITY",
  DELETE_IDENTITY = "DELETE_IDENTITY",
  DELETE_ALL_IDENTITIES = "DELETE_ALL_IDENTITIES",
  DOWNLOAD_BACKUP = "DOWNLOAD_BACKUP",
  UPLOAD_BACKUP = "UPLOAD_BACKUP",
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
