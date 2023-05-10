import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import EventEmitter from "../../background/services/event";
import { InjectedMessageData, MerkleProofArtifacts, RLNFullProof, SemaphoreProof, SelectedIdentity } from "../../types";
export declare class CryptKeeperInjectedProvider extends EventEmitter {
    readonly isCryptKeeper = true;
    private nonce;
    private zkProofService;
    constructor();
    /**
     * Connect to Extension
     * @returns injected client
     */
    connect(): Promise<void>;
    private tryInject;
    private post;
    private addHost;
    openPopup(): Promise<unknown>;
    eventResponser: (event: MessageEvent<InjectedMessageData>) => unknown;
    clearApproved(): Promise<unknown>;
    getIdentityCommitments(): Promise<unknown>;
    getActiveIdentity(): Promise<SelectedIdentity>;
    getHostPermissions(host: string): Promise<unknown>;
    setHostPermissions(host: string, permissions?: {
        noApproval?: boolean;
    }): Promise<unknown>;
    createIdentity(): Promise<unknown>;
    semaphoreProof(externalNullifier: string, signal: string, merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts, merkleProof?: MerkleProof): Promise<SemaphoreProof>;
    rlnProof(externalNullifier: string, signal: string, merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts, rlnIdentifier: string): Promise<RLNFullProof>;
}
