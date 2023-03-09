import type { JsonRpcSigner } from "ethers/types/providers";

import type { IdentityStrategy, IdentityWeb2Provider } from "@src/types";

export interface ISignIdentityMessageArgs {
  identityStrategyType: IdentityStrategy;
  signer?: JsonRpcSigner;
  web2Provider?: IdentityWeb2Provider;
  nonce?: number;
}

export async function signIdentityMessage({
  web2Provider,
  signer,
  nonce,
  identityStrategyType,
}: ISignIdentityMessageArgs): Promise<string | undefined> {
  const message =
    identityStrategyType === "interrep"
      ? getMessageTemplate(web2Provider as string, nonce)
      : getMessageTemplate(identityStrategyType);

  return signer?.signMessage(message);
}

function getMessageTemplate(type: string, nonce?: number): string {
  const nonceEnd = nonce !== undefined ? `with key nonce: ${nonce}` : "";
  return `Sign this message to generate your ${type} Semaphore identity ${nonceEnd}`.trim();
}
