import type { JsonRpcSigner } from "ethers";

export interface ISignIdentityMessageArgs {
  message: string;
  signer?: JsonRpcSigner;
}

const ACTION_REJECTED = "ACTION_REJECTED";

export async function signWithSigner({ signer, message }: ISignIdentityMessageArgs): Promise<string | undefined> {
  return signer?.signMessage(message).catch((error: Error & { code: string }) => {
    if (error.code === ACTION_REJECTED || error.message.includes("user rejected")) {
      throw new Error("User rejected signing");
    }

    throw error;
  });
}

export interface IGetMessageTemplateArgs {
  account: string;
  nonce: number;
}

export function getMessageTemplate({ account, nonce }: IGetMessageTemplateArgs): string {
  const nonceEnd = `with key nonce: ${nonce}`;
  return `Sign this message with account ${account} to generate your Semaphore identity ${nonceEnd}`.trim();
}
