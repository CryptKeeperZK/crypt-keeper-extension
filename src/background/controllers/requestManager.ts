import { EventEmitter2 } from "eventemitter2";
import { browser } from "webextension-polyfill-ts";

import { PendingRequest, PendingRequestType, RequestResolutionAction } from "@src/types";
import { setPendingRequest } from "@src/ui/ducks/requests";
import pushMessage from "@src/util/pushMessage";

import BrowserUtils from "./browserUtils";

let nonce = 0;

export default class RequestManager extends EventEmitter2 {
  private pendingRequests: Array<PendingRequest>;

  constructor() {
    super();
    this.pendingRequests = [];
  }

  getRequests = (): PendingRequest[] => this.pendingRequests;

  finalizeRequest = async (action: RequestResolutionAction<unknown>): Promise<boolean> => {
    const { id } = action;
    if (!id) throw new Error("id not provided");
    // TODO add some mutex lock just in case something strange occurs
    this.pendingRequests = this.pendingRequests.filter((pendingRequest) => pendingRequest.id !== id);
    this.emit(`${id}:finalized`, action);
    await pushMessage(setPendingRequest(this.pendingRequests));
    return true;
  };

  addToQueue = async (type: PendingRequestType, payload?: unknown): Promise<string> => {
    // eslint-disable-next-line no-plusplus
    const id = `${nonce++}`;
    this.pendingRequests.push({ id, type, payload });
    await pushMessage(setPendingRequest(this.pendingRequests));

    return id;
  };

  newRequest = async (type: PendingRequestType, payload?: unknown): Promise<unknown> => {
    const popup = await BrowserUtils.openPopup();
    const id = await this.addToQueue(type, payload);

    return new Promise((resolve, reject) => {
      const onPopupClose = (windowId: number) => {
        if (windowId === popup.id) {
          reject(new Error("user rejected."));
          browser.windows.onRemoved.removeListener(onPopupClose);
        }
      };

      browser.windows.onRemoved.addListener(onPopupClose);

      this.once(`${id}:finalized`, (action: RequestResolutionAction<unknown>) => {
        browser.windows.onRemoved.removeListener(onPopupClose);
        switch (action.status) {
          case "accept":
            resolve(action.data);
            return;
          case "reject":
            reject(new Error("user rejected."));
            return;
          default:
            reject(new Error(`action: ${action.status as string} not supproted`));
        }
      });
    });
  };
}
