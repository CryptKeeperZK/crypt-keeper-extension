import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const revealIdentityCommitment = async (): Promise<void> => {
  await client?.request({
    method: RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
  });
};

export { revealIdentityCommitment };
