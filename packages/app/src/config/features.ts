export enum Features {
  INTERREP_IDENTITY = "INTERREP_IDENTITY",
  USER_MNEMONIC = "USER_MNEMONIC",
}

export function getEnabledFeatures(): Record<Features, boolean> {
  return {
    [Features.INTERREP_IDENTITY]: isFeatureEnabled(process.env.INTERREP_IDENTITY),
    [Features.USER_MNEMONIC]: isFeatureEnabled(process.env.USER_MNEMONIC),
  };
}

function isFeatureEnabled(value?: string): boolean {
  return value === "true";
}
