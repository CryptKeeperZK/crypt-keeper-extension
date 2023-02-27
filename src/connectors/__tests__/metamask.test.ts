import { metamask, metamaskHooks } from "..";

describe("connectors/metamask", () => {
  test("should return connector objects and hooks", () => {
    expect(metamask).toBeDefined();
    expect(metamaskHooks).toBeDefined();
  });
});
