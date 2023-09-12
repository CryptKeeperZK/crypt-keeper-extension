/**
 * @jest-environment jsdom
 */

import { RPCAction } from "@cryptkeeperzk/providers";

import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import { joinGroup } from "../groups";

jest.mock("@src/util/postMessage");

describe("ui/ducks/groups", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should join group properly", async () => {
    const args = { groupId: "groupId", apiKey: "apiKey", inviteCode: "inviteCode" };
    (postMessage as jest.Mock).mockResolvedValue(true);

    const result = await Promise.resolve(store.dispatch(joinGroup(args)));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.JOIN_GROUP, payload: args });
    expect(result).toBe(true);
  });
});
