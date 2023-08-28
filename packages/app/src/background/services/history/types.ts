import { IIdentityData } from "@cryptkeeperzk/types";

import { OperationType, Operation, HistorySettings } from "@src/types";

export interface OperationOptions {
  identity?: IIdentityData;
}

export interface OperationFilter {
  type: OperationType;
}

export interface ILoadOperationsData {
  operations: Operation[];
  settings?: HistorySettings;
}
