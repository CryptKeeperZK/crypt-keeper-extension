import ZkIdentityDecorater from "@src/background/identityDecorater";
import { SemaphoreProofService } from "@src/background/services/zkProof";

import { ISemaphoreGenerateArgs, SemaphoreProofGenerator } from "..";

jest.mock("@src/background/identityDecorater", (): unknown => ({
  genFromSerialized: jest.fn(),
}));

jest.mock("@src/background/services/zkProof/SemaphoreProof");

describe("contentScripts/proof/semaphore", () => {
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
    (ZkIdentityDecorater.genFromSerialized as jest.Mock).mockReturnValue("serialized");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should generate proof properly", async () => {
    const semaphoreProofGenerator = SemaphoreProofGenerator.getInstance();
    const [semaphoreServiceInstance] = (SemaphoreProofService as jest.Mock).mock.instances as [{ genProof: jest.Mock }];
    semaphoreServiceInstance.genProof.mockResolvedValue(emptyFullProof);

    const result = await semaphoreProofGenerator.generate(defaultGenerateArgs);

    expect(semaphoreServiceInstance.genProof).toBeCalledTimes(1);
    expect(semaphoreServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
    expect(result).toStrictEqual(emptyFullProof);
  });
});
