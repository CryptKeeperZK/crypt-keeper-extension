import { ZkIdentitySemaphore } from "@src/background/services/zkIdentity/protocols/ZkIdentitySemaphore";
import { ZkIdentityFactoryService } from "@src/background/services/zkIdentity/services/ZkIdentityFactory";
import { ZERO_ADDRESS } from "@src/config/const";
import { ICreateIdentityArgs, StrategiesMap } from "@src/types";

class MockIdentityService extends ZkIdentityFactoryService {
  mockNewIdentity = (strategy: keyof StrategiesMap, config: ICreateIdentityArgs) =>
    this.createNewIdentity(strategy, config);
}

describe("background/servies/zkIdentity/servies/ZkIdentityFactory", () => {
  test("should create a random identity", () => {
    const mockIdentityService = new MockIdentityService();

    const identity1 = mockIdentityService.mockNewIdentity("random", {
      name: "name",
      account: ZERO_ADDRESS,
      identityStrategy: "random",
    });
    const identity2 = ZkIdentitySemaphore.genFromSerialized(identity1.serialize());

    expect(identity1.zkIdentity.getTrapdoor()).toEqual(identity2.zkIdentity.getTrapdoor());
    expect(identity1.zkIdentity.getNullifier()).toEqual(identity2.zkIdentity.getNullifier());
  });

  test("should create a twitter identity", () => {
    const mockIdentityService = new MockIdentityService();

    const identity1 = mockIdentityService.mockNewIdentity("interrep", {
      name: "name",
      account: ZERO_ADDRESS,
      identityStrategy: "interrep",
      web2Provider: "twitter",
      messageSignature: "signature",
    });
    const identity2 = ZkIdentitySemaphore.genFromSerialized(identity1.serialize());

    expect(identity1.zkIdentity.getTrapdoor()).toEqual(identity2.zkIdentity.getTrapdoor());
    expect(identity1.zkIdentity.getNullifier()).toEqual(identity2.zkIdentity.getNullifier());
  });

  test("should not create an interrep identity without the required parameters", () => {
    const mockIdentityService = new MockIdentityService();

    const fun = () =>
      mockIdentityService.mockNewIdentity("interrep", {
        name: "name",
        account: ZERO_ADDRESS,
        identityStrategy: "interrep",
      });

    expect(fun).toThrow();
  });
});
