import { IdentityStrategy, IdentityWeb2Provider, WalletInfoBackground } from "@src/types";

export interface IUseIdentityFactoryArgs {
  identityStrategyType: IdentityStrategy;
  web2Provider?: IdentityWeb2Provider;
  nonce?: number;
  walletInfo: WalletInfoBackground | null;
}

export async function useIdentityFactory({
  web2Provider,
  walletInfo,
  nonce,
  identityStrategyType,
}: IUseIdentityFactoryArgs): Promise<string | undefined> {
  const message =
    identityStrategyType === "interrep"
      ? getMessageTemplate(web2Provider as string, nonce)
      : getMessageTemplate(identityStrategyType);

  return walletInfo?.signer.signMessage(message);
}

function getMessageTemplate(type: string, nonce?: number): string {
  const nonceEnd = nonce !== undefined ? `with key nonce: ${nonce}` : "";
  return `Sign this message to generate your ${type} Semaphore identity ${nonceEnd}`.trim();
}
