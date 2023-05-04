import { MetaMask } from "@web3-react/metamask";

import type { Connector } from "@web3-react/types";

import { MockConnector } from "./mock";

export enum ConnectorNames {
  METAMASK = "MetaMask",
  MOCK = "Mock",
  UNKNOWN = "Unknown",
}

export function getConnectorName(connector: Connector): ConnectorNames {
  if (connector instanceof MetaMask) {
    return ConnectorNames.METAMASK;
  }

  if (connector instanceof MockConnector) {
    return ConnectorNames.MOCK;
  }

  return ConnectorNames.UNKNOWN;
}
