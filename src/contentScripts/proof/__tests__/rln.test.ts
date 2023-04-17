import { IdentityDecoraterService } from "@src/background/services/identity";
import { RLNService } from "@src/background/services/proof";

import { IRlnGenerateArgs, RlnProofGenerator } from "..";

jest.mock("@src/background/services/identity/IdentityDecorater", (): unknown => ({
  genFromSerialized: jest.fn(),
}));

jest.mock("@src/background/services/proof/RLN");

describe("contentScripts/proof/rln", () => {
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
    (IdentityDecoraterService.genFromSerialized as jest.Mock).mockReturnValue("serialized");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should generate proof properly", async () => {
    const rlnProofGenerator = RlnProofGenerator.getInstance();
    const [rlnServiceInstance] = (RLNService as jest.Mock).mock.instances as [{ genProof: jest.Mock }];
    rlnServiceInstance.genProof.mockResolvedValue(emptyFullProof);

    const result = await rlnProofGenerator.generate(defaultGenerateArgs);

    expect(rlnServiceInstance.genProof).toBeCalledTimes(1);
    expect(rlnServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
    expect(result).toStrictEqual(emptyFullProof);
  });
});
