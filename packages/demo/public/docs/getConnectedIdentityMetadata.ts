import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const getConnectedIdentityMetadata = async (): Promise<void> => {
  await client?.request({
    method: RPCExternalAction.GET_CONNECTED_IDENTITY_DATA,
  });
};

export { getConnectedIdentityMetadata };
