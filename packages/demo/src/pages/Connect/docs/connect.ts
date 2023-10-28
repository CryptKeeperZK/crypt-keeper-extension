import { initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const connect = async (isChangeIdentity = false): Promise<void> => {
  await client?.connect(isChangeIdentity);
};

export { connect };
