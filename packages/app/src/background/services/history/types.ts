import { OperationType, Operation, HistorySettings } from "@src/types";

import type { IGroupData, IIdentityData } from "@cryptkeeperzk/types";

export interface OperationOptions {
  identity?: IIdentityData;
  group?: Partial<IGroupData>;
}

export interface OperationFilter {
  type: OperationType;
}

export interface ILoadOperationsData {
  operations: Operation[];
  settings?: HistorySettings;
}
