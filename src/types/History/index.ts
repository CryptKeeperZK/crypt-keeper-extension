import { IdentityData } from "../Identity";

export enum OperationType {
  CREATE_IDENTITY = "CREATE_IDENTITY",
  DELETE_IDENTITY = "DELETE_IDENTITY",
  DELETE_ALL_IDENTITIES = "DELETE_ALL_IDENTITIES",
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
