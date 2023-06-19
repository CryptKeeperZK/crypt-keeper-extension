// TODO: temp until providers package isn't ready
import type { FullProof } from "@semaphore-protocol/proof";
import type { RLNFullProof } from "rlnjs";

export interface ConnectedIdentity {
  commitment: string;
  web2Provider?: string;
  host?: string;
}

export interface SemaphoreProof {
  fullProof: FullProof;
}

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

declare global {
  interface Window {
    cryptkeeper: CryptKeeperInjectedProvider;
  }
}
