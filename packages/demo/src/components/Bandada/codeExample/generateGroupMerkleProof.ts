import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const generateGroupMerkleProof = async (): Promise<void> => {
  await client?.request({
    method: RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF,
    payload: {
      groupId: process.env.TEST_GROUP_ID!,
    },
  });
};

export { generateGroupMerkleProof };
