import { MetaMask } from "@web3-react/metamask";
import type { Connector } from "@web3-react/types";

import { MockConnector } from "./mock";

export function getConnectorName(connector: Connector): string {
  if (connector instanceof MetaMask) return "MetaMask";
  if (connector instanceof MockConnector) return "Mock";

  return "Unknown";
}
