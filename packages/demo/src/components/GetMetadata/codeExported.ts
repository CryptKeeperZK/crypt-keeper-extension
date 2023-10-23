const GET_METADATA_CODE = `import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const getConnectedIdentityMetadata = async () => {
  await client
    ?.request({
      method: RPCExternalAction.GET_CONNECTED_IDENTITY_DATA,
    })
    .then((connectedIdentity) => {
      if (connectedIdentity) {
        // SOME CODE
      }
    })
    .catch(() => {
      // THROW ERROR
    });
};`;

export default GET_METADATA_CODE;
