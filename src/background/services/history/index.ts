import { nanoid } from "nanoid";
import { browser } from "webextension-polyfill-ts";

import { getEnabledFeatures } from "@src/config/features";
import { HistorySettings, IdentityData, Operation, OperationType } from "@src/types";

import LockService from "../lock";
import NotificationService from "../notification";
import SimpleStorage from "../simpleStorage";

const HISTORY_KEY = "@@HISTORY@@";
const HISTORY_SETTINGS_KEY = "@@HISTORY-SETTINGS@@";

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

export default class HistoryService {
  private static INSTANCE: HistoryService;

  private historyStore: SimpleStorage;

  private historySettingsStore: SimpleStorage;

  private lockService: LockService;

  private notificationService: NotificationService;

  private operations: Operation[];

  private settings?: HistorySettings;

  private constructor() {
    this.historyStore = new SimpleStorage(HISTORY_KEY);
    this.historySettingsStore = new SimpleStorage(HISTORY_SETTINGS_KEY);
    this.lockService = LockService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.operations = [];
    this.settings = undefined;
  }

  static getInstance(): HistoryService {
    if (!HistoryService.INSTANCE) {
      HistoryService.INSTANCE = new HistoryService();
    }

    return HistoryService.INSTANCE;
  }

  enableHistory = async (isEnabled: boolean): Promise<void> => {
    this.settings = { isEnabled };
    await this.writeSettings(this.settings);
  };

  loadOperations = async (): Promise<ILoadOperationsData> => {
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

  getOperations = (filter?: Partial<OperationFilter>): Operation[] =>
    this.operations.filter((operation) => (filter?.type ? operation.type === filter.type : true));

  getSettings = (): HistorySettings | undefined => this.settings;

  trackOperation = async (type: OperationType, { identity }: OperationOptions): Promise<void> => {
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

  removeOperation = async (id: string): Promise<Operation[]> => {
    this.operations = this.operations.filter((operation) => operation.id !== id);

    await this.writeOperations(this.operations);

    return this.operations;
  };

  clear = async (): Promise<void> => {
    this.operations = [];
    await this.historyStore.clear();

    await this.notificationService.create({
      options: {
        title: "History clear",
        message: "History operations has been cleared",
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });
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
