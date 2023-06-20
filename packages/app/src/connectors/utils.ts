import { MetaMask } from "@web3-react/metamask";

import { ConnectorNames } from "@src/types";

import type { Connector } from "@web3-react/types";

import { CryptkeeperConnector } from "./cryptKeeper";
import { MockConnector } from "./mock";

export function getConnectorName(connector: Connector): ConnectorNames {
  if (connector instanceof MetaMask) {
    return ConnectorNames.METAMASK;
  }

  if (connector instanceof CryptkeeperConnector) {
    return ConnectorNames.CRYPTKEEPER;
  }

  if (connector instanceof MockConnector) {
    return ConnectorNames.MOCK;
  }

  return ConnectorNames.UNKNOWN;
}
