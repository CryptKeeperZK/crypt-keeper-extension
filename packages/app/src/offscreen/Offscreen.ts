import { RPCAction } from "@cryptkeeperzk/providers";
import { RequestHandler } from "@cryptkeeperzk/types";
import Handler from "@src/background/controllers/handler";

export class OffscreenController {
    private handler: Handler;

    constructor() {
        this.handler = new Handler();
    }

    handle = (request: RequestHandler): Promise<unknown> => this.handler.handle(request);

    initialize = (): OffscreenController => {
        this.handler.add(RPCAction.GENERATE_SEMAPHORE_PROOF, this.generateSemaphoreProof);
        return this;
    }

    generateSemaphoreProof = () => {
        console.log("Fcuk yest")
        return true;
    }
}

