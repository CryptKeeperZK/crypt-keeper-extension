export enum Features {
  INTERREP_IDENTITY = "INTERREP_IDENTITY",
  BACKUP = "BACKUP",
  USER_MNEMONIC = "USER_MNEMONIC",
}

export function getEnabledFeatures(): Record<Features, boolean> {
  return {
    [Features.INTERREP_IDENTITY]: isFeatureEnabled(process.env.INTERREP_IDENTITY),
    [Features.BACKUP]: isFeatureEnabled(process.env.BACKUP),
    [Features.USER_MNEMONIC]: isFeatureEnabled(process.env.USER_MNEMONIC),
  };
}

function isFeatureEnabled(value?: string): boolean {
  return value === "true";
}
