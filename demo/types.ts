// TODO: temp until providers package isn't ready
export interface SelectedIdentity {
  commitment: string;
  web2Provider?: string;
}

export interface CryptKeeperInjectedProvider {
  accounts: () => Promise<string[]>;
  connect: () => Promise<CryptKeeperInjectedProvider>;
  createIdentity: () => Promise<void>;
  getConnectedIdentity: () => Promise<SelectedIdentity>;
  cleanListeners: () => void;
  semaphoreProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | unknown,
    merkleProof?: unknown,
  ): Promise<unknown>;
  rlnProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | unknown,
    rlnIdentifier: string,
  ): Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    cryptkeeper: CryptKeeperInjectedProvider;
  }
}
