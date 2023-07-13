import { RequestHandler } from "@cryptkeeperzk/types";
import { OffscreenController } from "../Offscreen";
import { RPCAction } from "@cryptkeeperzk/providers";


describe("offscreen/offscreenController", () => {
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

        // Create a mock function for generateSemaphoreProof
        const generateSpy = jest.fn();

        // Replace the original method with the mock function
        offscreenController.generateSemaphoreProof = generateSpy;

        const mockRequest: RequestHandler = {
            method: RPCAction.GENERATE_SEMAPHORE_PROOF,
            source: "offscreen"
        }

        await offscreenController.handle(mockRequest);
        // Verify that the generateSemaphoreProof method was called
        expect(generateSpy).toHaveBeenCalled();
        expect(offscreenController.generateSemaphoreProof).toBeCalled();
    });
});
