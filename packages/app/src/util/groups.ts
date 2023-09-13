import { getBandadaUrl } from "@src/config/env";

export const getBandadaGroupUrl = (groupId: string, type: "off-chain" | "on-chain" = "off-chain"): string =>
  `${getBandadaUrl()}/groups/${type}/${groupId}`;
