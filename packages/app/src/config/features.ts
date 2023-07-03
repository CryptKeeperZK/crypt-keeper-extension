export enum Features {
  INTERREP_IDENTITY = "INTERREP_IDENTITY",
  BACKUP = "BACKUP",
  RECOVER = "RECOVER",
}

export function getEnabledFeatures(): Record<Features, boolean> {
  return {
    [Features.INTERREP_IDENTITY]: isFeatureEnabled(process.env.INTERREP_IDENTITY),
    [Features.BACKUP]: isFeatureEnabled(process.env.BACKUP),
    [Features.RECOVER]: isFeatureEnabled(process.env.RECOVER),
  };
}

function isFeatureEnabled(value?: string): boolean {
  return value === "true";
}
