import {
  PendingRequest,
  PendingRequestType,
  RequestResolutionAction,
  RequestResolutionStatus,
} from "@cryptkeeperzk/types";
import { EventEmitter2 } from "eventemitter2";

import { setPendingRequests } from "@src/ui/ducks/requests";
import pushMessage from "@src/util/pushMessage";

import BrowserUtils from "./browserUtils";

export default class RequestManager {
  private static INSTANCE: RequestManager;

  private eventEmitter: EventEmitter2;

  private browserService: BrowserUtils;

  private pendingRequests: PendingRequest[];

  private nonce: number;

  private constructor() {
    this.eventEmitter = new EventEmitter2();
    this.pendingRequests = [];
    this.nonce = 0;
    this.browserService = BrowserUtils.getInstance();

    this.browserService.addRemoveWindowListener(this.clearRequests);
  }

  static getInstance(): RequestManager {
    if (!RequestManager.INSTANCE) {
      RequestManager.INSTANCE = new RequestManager();
    }

    return RequestManager.INSTANCE;
  }

  getNonce = (): number => this.nonce;

  getRequests = (): PendingRequest[] => this.pendingRequests;

  newRequest = async (type: PendingRequestType, payload?: unknown): Promise<unknown> => {
    const popup = await this.browserService.openPopup();
    const id = await this.addToQueue(type, popup.id, payload);

    return new Promise((resolve, reject) => {
      const onPopupClose = (windowId: number) => {
        if (windowId === popup.id) {
          reject(new Error("user rejected."));
          this.browserService.removeRemoveWindowListener(onPopupClose);
        }
      };

      this.browserService.addRemoveWindowListener(onPopupClose);

      this.eventEmitter.once(`${id}:finalized`, (action: RequestResolutionAction) => {
        this.browserService.removeRemoveWindowListener(onPopupClose);
        switch (action.status) {
          case RequestResolutionStatus.ACCEPT:
            resolve(action.data);
            return;
          case RequestResolutionStatus.REJECT:
            reject(new Error("user rejected."));
            return;
          default:
            reject(new Error(`action: ${action.status as string} not supproted`));
        }
      });
    });
  };

  finalizeRequest = async (action: RequestResolutionAction<unknown>): Promise<boolean> => {
    const { id } = action;

    // TODO add some mutex lock just in case something strange occurs
    this.pendingRequests = this.pendingRequests.filter((pendingRequest) => pendingRequest.id !== id);
    this.eventEmitter.emit(`${id}:finalized`, action);
    await pushMessage(setPendingRequests(this.pendingRequests));

    return true;
  };

  private addToQueue = async (type: PendingRequestType, windowId?: number, payload?: unknown): Promise<string> => {
    const id = this.nonce.toString();
    this.nonce += 1;
    this.pendingRequests.push({ id, windowId, type, payload });
    await pushMessage(setPendingRequests(this.pendingRequests));

    return id;
  };

  private clearRequests = (windowId?: number): void => {
    if (windowId) {
      this.pendingRequests = this.pendingRequests.filter((pendingRequests) => pendingRequests.windowId !== windowId);
    }
  };
}
