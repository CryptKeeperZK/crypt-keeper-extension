import type ZkIdentityDecorater from "@src/background/identityDecorater";

export enum OperationType {
  CREATE_IDENTITY = "CREATE_IDENTITY",
  DELETE_IDENTITY = "DELETE_IDENTITY",
}

export interface OperationOptions {
  identity: ZkIdentityDecorater;
}

export interface Operation extends OperationOptions {
  type: OperationType;
  createdAt: Date;
}

export type SerializedOperation = Omit<Operation, "identity"> & { identity: string };

export interface OperationFilter {
  type: OperationType;
}
