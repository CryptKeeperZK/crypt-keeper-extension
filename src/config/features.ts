export enum Features {
  RANDOM_IDENTITY = "RANDOM_IDENTITY",
}

export function getEnabledFeatures(): Record<Features, boolean> {
  return {
    [Features.RANDOM_IDENTITY]: isFeatureEnabled(process.env.RANDOM_IDENTITY),
  };
}

function isFeatureEnabled(value?: string): boolean {
  return value === "true";
}
