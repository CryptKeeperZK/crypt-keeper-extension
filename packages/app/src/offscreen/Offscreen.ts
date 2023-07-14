import { RPCAction } from "@cryptkeeperzk/providers";
import { ISemaphoreGenerateArgs, MerkleProof, RequestHandler, SemaphoreProofRequest } from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, getMerkleProof } from "@cryptkeeperzk/zk";
import { generateProof } from "@cryptkeeperzk/semaphore-proof";
import BrowserUtils from "@src/background/controllers/browserUtils";
import Handler from "@src/background/controllers/handler";
import browser from "webextension-polyfill";
import pushMessage from "@src/util/pushMessage";

export class OffscreenController {
    private handler: Handler;

    constructor() {
        this.handler = new Handler();
    }

    handle = (request: RequestHandler): Promise<unknown> => this.handler.handle(request);

    initialize = (): OffscreenController => {
        this.handler.add(RPCAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN, this.generateSemaphoreProof);
        return this;
    }

    generateSemaphoreProof = async ({
        circuitFilePath,
        externalNullifier,
        identitySerialized,
        merkleProofArtifacts,
        signal,
        verificationKey,
        zkeyFilePath
    }: SemaphoreProofRequest) => {
        const identityGenerated = ZkIdentitySemaphore.genFromSerialized(identitySerialized);

        const identityCommitment = identityGenerated.genIdentityCommitment();

        const merkleProof = await getMerkleProof({
            identityCommitment,
            merkleProofArtifacts
        });

        const fullProof = await generateProof(identityGenerated.zkIdentity, merkleProof, externalNullifier, signal, {
            wasmFilePath: circuitFilePath,
            zkeyFilePath,
        });

        return fullProof;
    }
}

