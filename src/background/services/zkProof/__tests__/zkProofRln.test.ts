import { ZkIdentityDecorater } from "@src/background/services/zkIdentity/services/zkIdentityDecorater";
import { IRlnGenerateArgs } from "@src/types";

import ZkProofService from "..";
import { RLNProofService } from "../protocols";

jest.mock("@src/background/services/zkIdentity/services/zkIdentityDecorater", (): unknown => ({
  genFromSerialized: jest.fn(),
}));

jest.mock("@src/background/services/zkProof/protocols/RLNProof");

describe("background/services/zkProof", () => {
  describe("RLNProof", () => {
    const defaultGenerateArgs: IRlnGenerateArgs = {
      identity: "identity",
      payload: {
        externalNullifier: "externalNullifier",
        signal: "0x0",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
        rlnIdentifier: "rlnIdentifier",
      },
    };

    const emptyFullProof = {
      proof: {},
      publicSignals: {},
    };

    beforeEach(() => {
      (ZkIdentityDecorater.genFromSerialized as jest.Mock).mockReturnValue("serialized");
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test("should generate proof properly", async () => {
      const zkProofGenerator = ZkProofService.getInstance();
      const [rlnServiceInstance] = (RLNProofService as jest.Mock).mock.instances as [{ genProof: jest.Mock }];
      rlnServiceInstance.genProof.mockResolvedValue(emptyFullProof);

      const result = await zkProofGenerator.generateRLNProof(
        ZkIdentityDecorater.genFromSerialized(defaultGenerateArgs.identity),
        defaultGenerateArgs.payload,
      );

      expect(rlnServiceInstance.genProof).toBeCalledTimes(1);
      expect(rlnServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
      expect(result).toStrictEqual(emptyFullProof);
    });
  });
});
