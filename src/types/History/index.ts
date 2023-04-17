import { IdentityMetadata } from "../Identity";

export enum OperationType {
  CREATE_IDENTITY = "CREATE_IDENTITY",
  DELETE_IDENTITY = "DELETE_IDENTITY",
}

export interface Operation {
  type: OperationType;
  identity: {
    commitment: string;
    metadata: IdentityMetadata;
  };
  createdAt: string;
}
