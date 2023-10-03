import { PendingRequestType, RequestResolutionStatus } from "@cryptkeeperzk/types";

import { setPendingRequests } from "@src/ui/ducks/requests";
import pushMessage from "@src/util/pushMessage";

import RequestManager from "../requestManager";

const mockDefaultWindow = { id: 1 };

const mockRemoveListeners: ((window?: number) => void)[] = [];

const mockDefaultBrowserUtils = {
  openPopup: jest.fn(() => Promise.resolve(mockDefaultWindow)),
  closePopup: jest.fn().mockImplementation((windowId?: number) => {
    mockRemoveListeners.forEach((listener) => {
      listener(windowId);
    });
  }),
  addRemoveWindowListener: jest.fn().mockImplementation((listener: (windowId?: number) => void) => {
    mockRemoveListeners.push(listener);
  }),
  removeRemoveWindowListener: jest.fn(),
};

jest.mock("../browserUtils", (): unknown => ({
  getInstance: jest.fn(() => mockDefaultBrowserUtils),
}));

describe("background/controllers/requestManager", () => {
  const requestManager = RequestManager.getInstance();

  const createTimeout = (): Promise<void> =>
    new Promise((resolve) => {
      // need to wait until we get popup and add request to queue
      setTimeout(resolve, 1000);
    });

  afterEach(() => {
    (pushMessage as jest.Mock).mockClear();
    mockDefaultBrowserUtils.addRemoveWindowListener.mockClear();
    mockDefaultBrowserUtils.removeRemoveWindowListener.mockClear();
  });

  test("should create new request and notify properly", async () => {
    const nonce = requestManager.getNonce();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    const requests = requestManager.getRequests();
    expect(requests).toHaveLength(1);
    expect(pushMessage).toBeCalledTimes(1);
    expect(pushMessage).toBeCalledWith(setPendingRequests(requests));

    const finalized = await requestManager.finalizeRequest({
      id: nonce.toString(),
      status: RequestResolutionStatus.ACCEPT,
      data: { done: true },
    });

    expect(finalized).toBe(true);
  });

  test("should finalize request and notify properly", async () => {
    const nonce = requestManager.getNonce();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    const finalized = await requestManager.finalizeRequest({
      id: nonce.toString(),
      status: RequestResolutionStatus.ACCEPT,
      data: { done: true },
    });

    expect(finalized).toBe(true);
    expect(requestPromise).resolves.toStrictEqual({ done: true });
    expect(pushMessage).toBeCalledTimes(2);
    expect(mockDefaultBrowserUtils.addRemoveWindowListener).toBeCalledTimes(1);
    expect(mockDefaultBrowserUtils.removeRemoveWindowListener).toBeCalledTimes(1);
  });

  test("should reject request properly", async () => {
    const nonce = requestManager.getNonce();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    const finalized = await requestManager.finalizeRequest({
      id: nonce.toString(),
      status: RequestResolutionStatus.REJECT,
    });

    expect(finalized).toBe(true);
    expect(requestPromise).rejects.toStrictEqual(new Error("User rejected your request."));
  });

  test("should handle unknown request finalization type properly", async () => {
    const nonce = requestManager.getNonce();

    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    const finalized = await requestManager.finalizeRequest({
      id: nonce.toString(),
      status: "unknown" as RequestResolutionStatus,
    });

    expect(finalized).toBe(true);
    expect(requestPromise).rejects.toStrictEqual(new Error("action: unknown not supported"));
  });

  test("should handle reject request finalization type properly if user closes popup", async () => {
    const requestPromise = requestManager.newRequest(PendingRequestType.APPROVE, { origin: "http://localhost:3000" });
    await Promise.race([requestPromise, createTimeout()]);

    await mockDefaultBrowserUtils.closePopup(mockDefaultWindow.id);

    expect(requestPromise).rejects.toStrictEqual(new Error("User rejected your request."));
  });
});
