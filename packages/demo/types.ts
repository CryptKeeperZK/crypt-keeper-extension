// TODO: temp until providers package isn't ready
import type { RLNFullProof, SemaphoreProof, ConnectedIdentity } from "@cryptkeeper/types";

export interface CryptKeeperInjectedProvider {
  accounts: () => Promise<string[]>;
  connect: () => Promise<CryptKeeperInjectedProvider>;
  createIdentity: (payload: { host: string }) => Promise<void>;
  connectIdentity: (payload: { host: string }) => Promise<void>;
  getConnectedIdentity: () => Promise<ConnectedIdentity>;
  cleanListeners: () => void;
  semaphoreProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | unknown,
    merkleProof?: unknown,
  ): Promise<SemaphoreProof>;
  rlnProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | unknown,
    rlnIdentifier: string,
  ): Promise<RLNFullProof>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
}
