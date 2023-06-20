import { MetaMask, MetaMaskConstructorArgs } from "@web3-react/metamask";

import { ConnectorNames } from "@src/types";

import type { Actions, Connector } from "@web3-react/types";

import { getConnectorName, CryptkeeperConnector } from "..";
import { MockConnector } from "../mock";

describe("connectors/utils", () => {
  test("should return proper connector name", () => {
    expect(getConnectorName({} as Connector)).toBe(ConnectorNames.UNKNOWN);
    expect(getConnectorName(new MetaMask({} as MetaMaskConstructorArgs))).toBe(ConnectorNames.METAMASK);
    expect(getConnectorName(new MockConnector({} as Actions))).toBe(ConnectorNames.MOCK);
    expect(getConnectorName(new CryptkeeperConnector({} as Actions))).toBe(ConnectorNames.CRYPTKEEPER);
  });
});
