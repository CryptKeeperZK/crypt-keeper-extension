import { ISemaphoreGenerateArgs, RequestHandler, SemaphoreProofRequest } from "@cryptkeeperzk/types";
import { OffscreenController } from "../Offscreen";
import { RPCAction } from "@cryptkeeperzk/providers";
import { ZkIdentitySemaphore } from "@cryptkeeperzk/zk";

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
    ZkIdentitySemaphore: {
        genFromSerialized: jest.fn(),
        genIdentityCommitment: jest.fn()
    },
}));

describe("offscreen/offscreenController", () => {
    const defaultGenerateArgs: SemaphoreProofRequest = {
        identitySerialized: "identitySerialized",
        externalNullifier: "externalNullifier",
        signal: "0x0",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
    };

    const emptyFullProof = {
        fullProof: {
            proof: {},
            publicSignals: {},
        },
    };

    beforeEach(() => {
        (ZkIdentitySemaphore.genFromSerialized as jest.Mock).mockReturnValue("serialized");
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // test("should be able to initialize Offscreen controller", async () => {
    //     const offscreenController = new OffscreenController();
    //     //offscreenController.initialize();

    //     const mockRequest: RequestHandler = {
    //         method: RPCAction.GENERATE_SEMAPHORE_PROOF,
    //         source: "offscreen"
    //     }
    //     expect(await offscreenController.handle(mockRequest)).toThrow("method: undefined is not detected")
    // });

    test("should be able to listen to GENERATE_SEMAPHORE_PROOF RPC call", async () => {
        const offscreenController = new OffscreenController();
        offscreenController.initialize();

        const mockRequest: RequestHandler = {
            method: RPCAction.GENERATE_SEMAPHORE_PROOF,
            source: "offscreen"
        }

        await offscreenController.handle(mockRequest);
        // Verify that the generateSemaphoreProof method was called
        // TODO: how to test this probably
        //expect(offscreenController.generateSemaphoreProof).toHaveBeenCalled();
    });

    test("should ignore non-offscreen messages", async () => {
        const offscreenController = new OffscreenController();
        offscreenController.initialize();

        const mockRequest: RequestHandler = {
            method: RPCAction.GENERATE_SEMAPHORE_PROOF
        }
    });


    test("should be able to generate a semaphore proof", async () => {
        const offscreenController = new OffscreenController();
        offscreenController.initialize();

        const result = await offscreenController.generateSemaphoreProof(defaultGenerateArgs);

        expect(result).toStrictEqual(emptyFullProof);
    });
});
