export enum Features {
  USER_MNEMONIC = "USER_MNEMONIC",
  VERIFIABLE_CREDENTIALS = "VERIFIABLE_CREDENTIALS",
}

export function getEnabledFeatures(): Record<Features, boolean> {
  return {
    [Features.USER_MNEMONIC]: isFeatureEnabled(process.env.USER_MNEMONIC),
    [Features.VERIFIABLE_CREDENTIALS]: isFeatureEnabled(process.env.VERIFIABLE_CREDENTIALS),
  };
}

function isFeatureEnabled(value?: string): boolean {
  return value === "true";
}
