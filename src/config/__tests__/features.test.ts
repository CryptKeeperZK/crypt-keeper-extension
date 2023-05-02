import { getEnabledFeatures, Features } from "../features";

jest.unmock("@src/config/features");

describe("config/features", () => {
  const restoreEnv = {
    RANDOM_IDENTITY: process.env.RANDOM_IDENTITY,
    BACKUP: process.env.BACKUP,
  };

  beforeAll(() => {
    process.env.RANDOM_IDENTITY = "true";
    process.env.BACKUP = "true";
  });

  afterAll(() => {
    process.env.RANDOM_IDENTITY = restoreEnv.RANDOM_IDENTITY;
    process.env.BACKUP = restoreEnv.BACKUP;
  });

  test("should return enabled features properly", () => {
    expect(getEnabledFeatures()).toStrictEqual({
      [Features.RANDOM_IDENTITY]: true,
      [Features.BACKUP]: true,
    });
  });
});
