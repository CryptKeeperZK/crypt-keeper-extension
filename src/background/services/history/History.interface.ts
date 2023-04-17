import { IdentityMetadata, OperationType } from "@src/types";

export interface OperationOptions {
  identity: {
    commitment: string;
    metadata: IdentityMetadata;
  };
}

export interface OperationFilter {
  type: OperationType;
}
