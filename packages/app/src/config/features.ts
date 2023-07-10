export enum Features {
  INTERREP_IDENTITY = "INTERREP_IDENTITY",
  BACKUP = "BACKUP",
}

export function getEnabledFeatures(): Record<Features, boolean> {
  return {
    [Features.INTERREP_IDENTITY]: isFeatureEnabled(process.env.INTERREP_IDENTITY),
    [Features.BACKUP]: isFeatureEnabled(process.env.BACKUP),
  };
}

function isFeatureEnabled(value?: string): boolean {
  return value === "true";
}
