import { getEnabledFeatures, Features } from "../features";

jest.unmock("@src/config/features");

describe("config/features", () => {
  const restoreEnv = {
    INTERREP_IDENTITY: process.env.INTERREP_IDENTITY,
    BACKUP: process.env.BACKUP,
  };

  beforeAll(() => {
    process.env.INTERREP_IDENTITY = "true";
    process.env.BACKUP = "true";
  });

  afterAll(() => {
    process.env.INTERREP_IDENTITY = restoreEnv.INTERREP_IDENTITY;
    process.env.BACKUP = restoreEnv.BACKUP;
  });

  test("should return enabled features properly", () => {
    expect(getEnabledFeatures()).toStrictEqual({
      [Features.INTERREP_IDENTITY]: true,
      [Features.BACKUP]: true,
    });
  });
});
