import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

interface IImportIdentityParams {
  trapdoor: string;
  nullifier: string;
}

const importIdentity = async ({ trapdoor, nullifier }: IImportIdentityParams): Promise<void> => {
  await client?.request({
    method: RPCExternalAction.IMPORT_IDENTITY,
    payload: {
      trapdoor,
      nullifier,
    },
  });
};

export { importIdentity };
