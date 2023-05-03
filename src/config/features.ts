export enum Features {
  RANDOM_IDENTITY = "RANDOM_IDENTITY",
  BACKUP = "BACKUP",
}

export function getEnabledFeatures(): Record<Features, boolean> {
  return {
    [Features.RANDOM_IDENTITY]: isFeatureEnabled(process.env.RANDOM_IDENTITY),
    [Features.BACKUP]: isFeatureEnabled(process.env.BACKUP),
  };
}

function isFeatureEnabled(value?: string): boolean {
  return value === "true";
}
