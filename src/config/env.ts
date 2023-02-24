export function isDebugMode(): boolean {
  return process.env.CRYPTKEEPER_DEBUG === "true";
}

export type Providers = "infura" | "alchemy" | "freightTrustNetwork" | "pulseChain";

export function getApiKeys(): Record<Providers, string | undefined> {
  return {
    infura: process.env.INFURA_API_KEY,
    alchemy: process.env.ALCHEMY_API_KEY,
    freightTrustNetwork: process.env.FREIGHT_TRUST_NETWORK,
    pulseChain: process.env.PULSECHAIN_API_KEY,
  };
}
