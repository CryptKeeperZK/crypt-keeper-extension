import { MetaMask } from "@web3-react/metamask";

import { ConnectorNames } from "@src/types";

import type { Connector } from "@web3-react/types";

import { CryptKeeperConnector } from "./cryptKeeper";
import { MockConnector } from "./mock";

export function getConnectorName(connector: Connector): ConnectorNames {
  if (connector instanceof MetaMask) {
    return ConnectorNames.METAMASK;
  }

  if (connector instanceof CryptKeeperConnector) {
    return ConnectorNames.CRYPT_KEEPER;
  }

  if (connector instanceof MockConnector) {
    return ConnectorNames.MOCK;
  }

  return ConnectorNames.UNKNOWN;
}
