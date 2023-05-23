import { Web3ReactHooks } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

import { type CryptKeeperConnector, cryptKeeper, cryptKeeperHooks } from "./cryptKeeper";
import { metamask, metamaskHooks } from "./metamask";

export type Connector = MetaMask;

export const connectors: [[MetaMask, Web3ReactHooks], [CryptKeeperConnector, Web3ReactHooks]] = [
  [metamask, metamaskHooks],
  [cryptKeeper, cryptKeeperHooks],
];

export * from "./metamask";
export * from "./cryptKeeper";
export * from "./utils";
