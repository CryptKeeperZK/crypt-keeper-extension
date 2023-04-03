import { getEnabledFeatures, Features } from "../features";

jest.unmock("@src/config/features");

describe("config/features", () => {
  const restoreEnv = {
    RANDOM_IDENTITY: process.env.RANDOM_IDENTITY,
  };

  beforeAll(() => {
    process.env.RANDOM_IDENTITY = "true";
  });

  afterAll(() => {
    process.env.RANDOM_IDENTITY = restoreEnv.RANDOM_IDENTITY;
  });

  test("should return enabled features properly", () => {
    expect(getEnabledFeatures()).toStrictEqual({
      [Features.RANDOM_IDENTITY]: true,
    });
  });
});
