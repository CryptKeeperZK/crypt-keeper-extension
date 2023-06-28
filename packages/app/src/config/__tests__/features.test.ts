import { getEnabledFeatures, Features } from "../features";

jest.unmock("@src/config/features");

describe("config/features", () => {
  const restoreEnv = {
    INTERREP_IDENTITY: process.env.INTERREP_IDENTITY,
    BACKUP: process.env.BACKUP,
    RECOVER: process.env.RECOVER,
  };

  beforeAll(() => {
    process.env.INTERREP_IDENTITY = "true";
    process.env.BACKUP = "true";
    process.env.RECOVER = "true";
  });

  afterAll(() => {
    process.env.INTERREP_IDENTITY = restoreEnv.INTERREP_IDENTITY;
    process.env.BACKUP = restoreEnv.BACKUP;
    process.env.RECOVER = restoreEnv.RECOVER;
  });

  test("should return enabled features properly", () => {
    expect(getEnabledFeatures()).toStrictEqual({
      [Features.INTERREP_IDENTITY]: true,
      [Features.BACKUP]: true,
      [Features.RECOVER]: true,
    });
  });
});
