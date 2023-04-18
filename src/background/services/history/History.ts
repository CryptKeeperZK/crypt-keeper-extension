import { LockService } from "@src/background/services/lock";
import { SimpleStorageService } from "@src/background/services/storage";
import { getEnabledFeatures } from "@src/config/features";
import { Operation, OperationType } from "@src/types";

import { OperationFilter, OperationOptions } from "./interface";

const HISTORY_KEY = "@@HISTORY@@";

export class HistoryService {
  private static INSTANCE: HistoryService;

  private historyStore: SimpleStorageService;

  private lockService: LockService;

  private operations: Operation[];

  private constructor() {
    this.historyStore = new SimpleStorageService(HISTORY_KEY);
    this.lockService = LockService.getInstance();
    this.operations = [];
  }

  public static getInstance(): HistoryService {
    if (!HistoryService.INSTANCE) {
      HistoryService.INSTANCE = new HistoryService();
    }

    return HistoryService.INSTANCE;
  }

  public loadOperations = async (): Promise<Operation[]> => {
    const features = getEnabledFeatures();
    const serializedOperations = await this.historyStore
      .get<string>()
      .then((serialized) => (serialized ? (JSON.parse(serialized) as Operation[]) : []));

    this.operations = serializedOperations.filter(({ identity }) =>
      !features.RANDOM_IDENTITY ? identity.metadata.identityStrategy !== "random" : true,
    );

    return this.operations;
  };

  public getOperations = (filter?: Partial<OperationFilter>): Operation[] =>
    this.operations.filter((operation) => (filter?.type ? operation.type === filter.type : true));

  public trackOperation = async (type: OperationType, { identity }: OperationOptions): Promise<void> => {
    this.operations.push({
      type,
      identity,
      createdAt: new Date().toISOString(),
    });
    const cipherText = this.lockService.encrypt(JSON.stringify(this.operations));
    await this.historyStore.set(cipherText);
  };

  public clear = async (): Promise<void> => {
    await this.historyStore.clear();
    this.operations = [];
  };
}
