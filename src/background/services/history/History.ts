import { nanoid } from "nanoid";

import { LockService } from "@src/background/services/lock";
import { SimpleStorageService } from "@src/background/services/storage";
import { getEnabledFeatures } from "@src/config/features";
import { HistorySettings, Operation, OperationType } from "@src/types";

import { ILoadOperationsData, OperationFilter, OperationOptions } from "./interface";

const HISTORY_KEY = "@@HISTORY@@";
const HISTORY_SETTINGS_KEY = "@@HISTORY-SETTINGS@@";

export class HistoryService {
  private static INSTANCE: HistoryService;

  private historyStore: SimpleStorageService;

  private historySettingsStore: SimpleStorageService;

  private lockService: LockService;

  private operations: Operation[];

  private settings?: HistorySettings;

  private constructor() {
    this.historyStore = new SimpleStorageService(HISTORY_KEY);
    this.historySettingsStore = new SimpleStorageService(HISTORY_SETTINGS_KEY);
    this.lockService = LockService.getInstance();
    this.operations = [];
    this.settings = undefined;
  }

  public static getInstance(): HistoryService {
    if (!HistoryService.INSTANCE) {
      HistoryService.INSTANCE = new HistoryService();
    }

    return HistoryService.INSTANCE;
  }

  public enableHistory = async (isEnabled: boolean): Promise<void> => {
    this.settings = { isEnabled };
    await this.writeSettings(this.settings);
  };

  public loadOperations = async (): Promise<ILoadOperationsData> => {
    await this.loadSettings();

    const features = getEnabledFeatures();
    const serializedOperations = await this.historyStore
      .get<string>()
      .then((raw) => (raw ? this.lockService.decrypt(raw) : JSON.stringify([])))
      .then((serialized) => JSON.parse(serialized) as Operation[]);

    this.operations = serializedOperations
      .filter(({ identity }) => (!features.RANDOM_IDENTITY ? identity?.metadata.identityStrategy !== "random" : true))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return { operations: this.operations, settings: this.settings };
  };

  public getOperations = (filter?: Partial<OperationFilter>): Operation[] =>
    this.operations.filter((operation) => (filter?.type ? operation.type === filter.type : true));

  public getSettings = (): HistorySettings | undefined => this.settings;

  public trackOperation = async (type: OperationType, { identity }: OperationOptions): Promise<void> => {
    if (!this.settings?.isEnabled) {
      return;
    }

    this.operations.push({
      id: nanoid(),
      type,
      identity,
      createdAt: new Date().toISOString(),
    });

    await this.writeOperations(this.operations);
  };

  public removeOperation = async (id: string): Promise<Operation[]> => {
    this.operations = this.operations.filter((operation) => operation.id !== id);

    await this.writeOperations(this.operations);

    return this.operations;
  };

  public clear = async (): Promise<void> => {
    this.operations = [];
    await this.historyStore.clear();
  };

  private loadSettings = async (): Promise<HistorySettings> => {
    this.settings = await this.historySettingsStore
      .get<string>()
      .then((settings) => (settings ? (JSON.parse(settings) as HistorySettings) : undefined));

    if (!this.settings) {
      this.settings = { isEnabled: true };
      await this.writeSettings(this.settings);
    }

    return this.settings;
  };

  private writeOperations = async (operations: Operation[]) => {
    const cipherText = this.lockService.encrypt(JSON.stringify(operations));
    await this.historyStore.set(cipherText);
  };

  private writeSettings = async (settings: HistorySettings) => {
    await this.historySettingsStore.set(JSON.stringify(settings));
  };
}
