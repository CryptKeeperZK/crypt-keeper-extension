import { getEnabledFeatures, Features } from "../features";

jest.unmock("@src/config/features");

describe("config/features", () => {
  const restoreEnv = {
    INTEREP_IDENTITY: process.env.INTEREP_IDENTITY,
    USER_MNEMONIC: process.env.USER_MNEMONIC,
    VERIFIABLE_CREDENTIALS: process.env.VERIFIABLE_CREDENTIALS,
  };

  beforeAll(() => {
    process.env.INTEREP_IDENTITY = "true";
    process.env.USER_MNEMONIC = "true";
    process.env.VERIFIABLE_CREDENTIALS = "true";
  });

  afterAll(() => {
    process.env.INTEREP_IDENTITY = restoreEnv.INTEREP_IDENTITY;
    process.env.USER_MNEMONIC = restoreEnv.USER_MNEMONIC;
    process.env.VERIFIABLE_CREDENTIALS = restoreEnv.VERIFIABLE_CREDENTIALS;
  });

  test("should return enabled features properly", () => {
    expect(getEnabledFeatures()).toStrictEqual({
      [Features.INTEREP_IDENTITY]: true,
      [Features.USER_MNEMONIC]: true,
      [Features.VERIFIABLE_CREDENTIALS]: true,
    });
  });
});
