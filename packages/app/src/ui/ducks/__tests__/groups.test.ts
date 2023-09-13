/**
 * @jest-environment jsdom
 */

import { RPCAction } from "@cryptkeeperzk/providers";

import { defaultMerkleProof } from "@src/config/mock/zk";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import { checkGroupMembership, generateGroupMerkleProof, joinGroup } from "../groups";

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

  test("should generate group merkle proof properly", async () => {
    const args = { groupId: "groupId" };
    (postMessage as jest.Mock).mockResolvedValue(defaultMerkleProof);

    const result = await Promise.resolve(store.dispatch(generateGroupMerkleProof(args)));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.GENERATE_GROUP_MERKLE_PROOF, payload: args });
    expect(result).toStrictEqual(defaultMerkleProof);
  });

  test("should check group membership properly", async () => {
    const args = { groupId: "groupId", apiKey: "apiKey", inviteCode: "inviteCode" };
    (postMessage as jest.Mock).mockResolvedValue(true);

    const result = await Promise.resolve(store.dispatch(checkGroupMembership(args)));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.CHECK_GROUP_MEMBERSHIP, payload: args });
    expect(result).toBe(true);
  });
});
