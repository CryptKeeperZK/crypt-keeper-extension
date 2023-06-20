import { ZkIdentitySemaphore } from "@src/background/services/zkIdentity/protocols/ZkIdentitySemaphore";
import { ISemaphoreGenerateArgs } from "@src/types";

import ZkProofService from "..";
import { SemaphoreProofService } from "../protocols";

jest.mock("@src/background/services/zkIdentity/protocols/ZkIdentitySemaphore", (): unknown => ({
  ZkIdentitySemaphore: {
    genFromSerialized: jest.fn(),
  },
}));

jest.mock("@src/background/services/zkProof/protocols/SemaphoreProof");

describe("background/services/zkProof", () => {
  describe("SemaphoreProof", () => {
    const defaultGenerateArgs: ISemaphoreGenerateArgs = {
      identity: "identity",
      payload: {
        externalNullifier: "externalNullifier",
        signal: "0x0",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
      },
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
      jest.resetAllMocks();
    });

    test("should generate proof properly", async () => {
      const zkProofGenerator = ZkProofService.getInstance();
      const [semaphoreServiceInstance] = (SemaphoreProofService as jest.Mock).mock.instances as [
        { genProof: jest.Mock },
      ];
      semaphoreServiceInstance.genProof.mockResolvedValue(emptyFullProof);

      const result = await zkProofGenerator.generateSemaphoreProof(
        ZkIdentitySemaphore.genFromSerialized(defaultGenerateArgs.identity),
        defaultGenerateArgs.payload,
      );

      expect(semaphoreServiceInstance.genProof).toBeCalledTimes(1);
      expect(semaphoreServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
      expect(result).toStrictEqual(emptyFullProof);
    });
  });
});
