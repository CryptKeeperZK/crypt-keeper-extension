import { HistorySettings, IdentityData, Operation, OperationType } from "@src/types";

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
