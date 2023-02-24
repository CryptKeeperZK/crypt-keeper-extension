import { Web3ReactHooks } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

import { metamask, metamaskHooks } from "./metamask";

export type Connector = MetaMask;

export const connectors: [Connector, Web3ReactHooks][] = [[metamask, metamaskHooks]];

export * from "./metamask";
export * from "./utils";
