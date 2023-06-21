import { IdentityData, OperationType, Operation, HistorySettings } from "@src/types";

export interface OperationOptions {
  identity?: IdentityData;
}

export interface OperationFilter {
  type: OperationType;
}

export interface ILoadOperationsData {
  operations: Operation[];
  settings?: HistorySettings;
}
