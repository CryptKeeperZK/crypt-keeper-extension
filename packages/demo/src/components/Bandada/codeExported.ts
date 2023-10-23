export const GENERATE_MERKLE_TREE_CODE = `import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const generateGroupMerkleProof = async () => {
    await client?.request({
        method: RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF,
        payload: {
            groupId: process.env.TEST_GROUP_ID!,
        },
    });
}`;

export const JOIN_GROUP_CODE = `import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const joinGroup = async () => {
    await client?.request({
        method: RPCExternalAction.JOIN_GROUP,
        payload: {
            groupId: process.env.TEST_GROUP_ID!,
            apiKey: process.env.TEST_GROUP_API_KEY,
            inviteCode: process.env.TEST_GROUP_INVITE_CODE,
        },
    });
}`;
