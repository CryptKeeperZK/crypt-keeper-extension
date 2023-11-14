import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";
import { ConnectedIdentityMetadata } from "@cryptkeeperzk/types";

const client = initializeCryptKeeper();

const getConnectedIdentityMetadata = async (): Promise<ConnectedIdentityMetadata> =>
  (await client?.request({
    method: RPCExternalAction.GET_CONNECTED_IDENTITY_DATA,
  })) as ConnectedIdentityMetadata;

export { getConnectedIdentityMetadata };
