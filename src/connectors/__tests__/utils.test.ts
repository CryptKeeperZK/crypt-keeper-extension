import { MetaMask, MetaMaskConstructorArgs } from "@web3-react/metamask";
import type { Actions, Connector } from "@web3-react/types";

import { getConnectorName } from "..";
import { MockConnector } from "../mock";

describe("connectors/utils", () => {
  test("should return proper connector name", () => {
    expect(getConnectorName({} as Connector)).toBe("Unknown");
    expect(getConnectorName(new MetaMask({} as MetaMaskConstructorArgs))).toBe("MetaMask");
    expect(getConnectorName(new MockConnector({} as Actions))).toBe("Mock");
  });
});
