import type { IdentityStrategy, IdentityWeb2Provider } from "@src/types";
import type { JsonRpcSigner } from "ethers/types/providers";

export interface ISignIdentityMessageArgs {
  message: string;
  signer?: JsonRpcSigner;
}

export async function signWithSigner({ signer, message }: ISignIdentityMessageArgs): Promise<string | undefined> {
  return signer?.signMessage(message);
}

export interface IGetMessageTemplateArgs {
  identityStrategyType: IdentityStrategy;
  web2Provider?: IdentityWeb2Provider;
  nonce?: number;
}

export function getMessageTemplate({ identityStrategyType, nonce, web2Provider }: IGetMessageTemplateArgs): string {
  const nonceEnd = nonce !== undefined ? `with key nonce: ${nonce}` : "";
  const type = identityStrategyType === "interrep" ? (web2Provider as string) : identityStrategyType;
  return `Sign this message to generate your ${type} Semaphore identity ${nonceEnd}`.trim();
}
