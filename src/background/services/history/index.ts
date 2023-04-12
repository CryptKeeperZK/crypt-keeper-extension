import { getEnabledFeatures } from "@src/config/features";

import type { Operation, SerializedOperation, OperationType, OperationOptions, OperationFilter } from "./types";

import ZkIdentityDecorater from "../../identityDecorater";
import LockService from "../lock";
import SimpleStorage from "../simpleStorage";

const HISTORY_KEY = "@@HISTORY@@";

export * from "./types";

export default class HistoryService {
  private historyStore: SimpleStorage;

  private lockService: LockService;

  private operations: Operation[];

  public constructor() {
    this.historyStore = new SimpleStorage(HISTORY_KEY);
    this.lockService = LockService.getInstance();
    this.operations = [];
  }

  public loadOperations = async (): Promise<Operation[]> => {
    const features = getEnabledFeatures();
    const serializedOperations = await this.historyStore
      .get<string>()
      .then((serialized) => (serialized ? (JSON.parse(serialized) as SerializedOperation[]) : []));

    this.operations = serializedOperations
      .map((operation) => ({
        ...operation,
        identity: ZkIdentityDecorater.genFromSerialized(operation.identity),
        createdAt: new Date(operation.createdAt),
      }))
      .filter(({ identity }) => (!features.RANDOM_IDENTITY ? identity.metadata.identityStrategy !== "random" : true));

    return this.operations;
  };

  public getOperations = (filter?: Partial<OperationFilter>): Operation[] =>
    this.operations.filter((operation) => (filter?.type ? operation.type === filter.type : true));

  public trackOperation = async (type: OperationType, options: OperationOptions): Promise<void> => {
    const createdAt = new Date();
    const cipherText = this.lockService.encrypt(
      JSON.stringify(
        this.operations.map((operation) => ({
          ...operation,
          identity: operation.identity.serialize(),
          createdAt,
        })),
      ),
    );
    await this.historyStore.set(cipherText);
    this.operations.push({ type, createdAt, ...options });
  };
}
