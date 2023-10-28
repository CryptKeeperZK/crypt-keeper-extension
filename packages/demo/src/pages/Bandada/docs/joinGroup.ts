import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const joinGroup = async (): Promise<void> => {
  await client?.request({
    method: RPCExternalAction.JOIN_GROUP,
    payload: {
      groupId: process.env.TEST_GROUP_ID!,
      apiKey: process.env.TEST_GROUP_API_KEY,
      inviteCode: process.env.TEST_GROUP_INVITE_CODE,
    },
  });
};

export { joinGroup };
