import { Web3ReactHooks } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

import { type CryptkeeperConnector, cryptKeeper, cryptKeeperHooks } from "./cryptKeeper";
import { metamask, metamaskHooks } from "./metamask";

export const connectors: [[MetaMask, Web3ReactHooks], [CryptkeeperConnector, Web3ReactHooks]] = [
  [metamask, metamaskHooks],
  [cryptKeeper, cryptKeeperHooks],
];

export { metamask, metamaskHooks } from "./metamask";
export { CryptkeeperConnector, cryptKeeper, cryptKeeperHooks } from "./cryptKeeper";
export { getConnectorName } from "./utils";
