import { nanoid } from "nanoid";

import { getEnabledFeatures } from "@src/config/features";
import { IdentityMetadata, Operation, OperationType } from "@src/types";

import LockService from "../lock";
import SimpleStorage from "../simpleStorage";

const HISTORY_KEY = "@@HISTORY@@";
const HISTORY_SETTINGS_KEY = "@@HISTORY-SETTINGS@@";

export interface OperationOptions {
  identity: {
    commitment: string;
    metadata: IdentityMetadata;
  };
}

export interface OperationFilter {
  type: OperationType;
}

export interface HistorySettings {
  isEnabled: boolean;
}

export default class HistoryService {
  private static INSTANCE: HistoryService;

  private historyStore: SimpleStorage;

  private historySettingsStore: SimpleStorage;

  private lockService: LockService;

  private operations: Operation[];

  private settings?: HistorySettings;

  private constructor() {
    this.historyStore = new SimpleStorage(HISTORY_KEY);
    this.historySettingsStore = new SimpleStorage(HISTORY_SETTINGS_KEY);
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

  public loadOperations = async (): Promise<Operation[]> => {
    await this.loadSettings();

    if (!this.settings?.isEnabled) {
      return [];
    }

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

  public removeOperation = async (id: string): Promise<void> => {
    this.operations = this.operations.filter((operation) => operation.id !== id);

    await this.writeOperations(this.operations);
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
