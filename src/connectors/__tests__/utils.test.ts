import { MetaMask, MetaMaskConstructorArgs } from "@web3-react/metamask";

import type { Actions, Connector } from "@web3-react/types";

import { getConnectorName, ConnectorNames } from "..";
import { MockConnector } from "../mock";

describe("connectors/utils", () => {
  test("should return proper connector name", () => {
    expect(getConnectorName({} as Connector)).toBe(ConnectorNames.UNKNOWN);
    expect(getConnectorName(new MetaMask({} as MetaMaskConstructorArgs))).toBe(ConnectorNames.METAMASK);
    expect(getConnectorName(new MockConnector({} as Actions))).toBe(ConnectorNames.MOCK);
  });
});
