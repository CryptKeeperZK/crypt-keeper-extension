import { getApiKeys, getBandadaApiUrl, isDebugMode, isE2E } from "../env";

jest.unmock("@src/config/env");

describe("config/env", () => {
  beforeAll(() => {
    process.env.INFURA_API_KEY = "infura";
    process.env.ALCHEMY_API_KEY = "alchemy";
    process.env.FREIGHT_TRUST_NETWORK = "freightTrustNetwork";
    process.env.PULSECHAIN_API_KEY = "pulseChain";
    process.env.CRYPTKEEPER_DEBUG = "false";
    process.env.BANDADA_API_URL = "https://api.bandada.pse.dev";
  });

  afterAll(() => {
    delete process.env.INFURA_API_KEY;
    delete process.env.ALCHEMY_API_KEY;
    delete process.env.FREIGHT_TRUST_NETWORK;
    delete process.env.PULSECHAIN_API_KEY;
    delete process.env.CRYPTKEEPER_DEBUG;
    delete process.env.BANDADA_API_URL;
  });

  test("should return env api config", () => {
    const apiKeys = getApiKeys();

    expect(apiKeys).toStrictEqual({
      infura: "infura",
      alchemy: "alchemy",
      freightTrustNetwork: "freightTrustNetwork",
      pulseChain: "pulseChain",
    });
  });

  test("should check if debug mode is enabled", () => {
    expect(isDebugMode()).toBe(false);
  });

  test("should check if debug mode is enabled", () => {
    expect(isE2E()).toBe(false);
  });

  test("should return bandada api url", () => {
    expect(getBandadaApiUrl()).toBeDefined();
  });
});
