import { getChainsConfig, Chain } from "./chains";

export type { Chain };

export function getChains(): Record<number, Chain> {
  const chainsConfig = getChainsConfig();

  return chainsConfig.reduce<Record<number, Chain>>((acc, chain) => {
    acc[chain.chainId] = chain;

    return acc;
  }, {});
}

export function getChainIds(): number[] {
  const chainsConfig = getChainsConfig();

  return chainsConfig.map(({ chainId }) => chainId);
}

export function getRpcUrls(): Record<number, string[]> {
  const chains = getChains();

  return Object.keys(chains).reduce<Record<number, string[]>>((acc, chainId) => {
    const { rpc } = chains[Number(chainId)];
    const validUrls = rpc.filter(Boolean);

    if (validUrls.length) {
      acc[Number(chainId)] = validUrls;
    }

    return acc;
  }, {});
}
