import { getRpcUrls, getChainIds, getChains } from "../rpc";
import { getApiKeys } from "../env";

jest.mock("../env", (): unknown => ({
  getApiKeys: jest.fn(),
}));

describe("config/rpc", () => {
  beforeEach(() => {
    (getApiKeys as jest.Mock).mockReturnValue({
      infura: "INFURA_API_KEY",
      alchemy: "ALCHEMY_API_KEY",
      freightTrustNetwork: "FREIGHT_TRUST_NETWORK",
      pulseChain: "PULSECHAIN_API_KEY",
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return rpc urls", () => {
    const chainIds = getChainIds();
    const rpcUrls = getRpcUrls();

    for (const chainId of chainIds) {
      expect(rpcUrls[chainId].length).not.toBe(0);
    }
  });

  test("should handle case if there is no rpc for chain", () => {
    (getApiKeys as jest.Mock).mockReturnValue({});

    const chainIds = getChainIds();
    const chains = getChains();
    const rpcUrls = getRpcUrls();

    for (const chainId of chainIds) {
      if (rpcUrls[chainId]) {
        expect(rpcUrls[chainId].length).not.toBe(0);
      } else {
        expect(chains[chainId].rpc.length).toBe(0);
      }
    }
  });
});
