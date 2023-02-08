import { CreateIdentityWeb2Provider, WalletInfoBackgound } from "@src/types";

export async function useIdentityFactory(
  web2Provider: CreateIdentityWeb2Provider,
  nonce: number,
  walletInfo: WalletInfoBackgound | null,
): Promise<string | undefined> {
  const message = `Sign this message to generate your ${web2Provider} Semaphore identity with key nonce: ${nonce}.`;

  return walletInfo?.signer.signMessage(message);
}
