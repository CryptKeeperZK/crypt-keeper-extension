import { initializeConnector, Web3ReactHooks } from "@web3-react/core";
import { Connector } from "@web3-react/types";

export class MockConnector extends Connector {
  public activate(): Promise<void> | void {
    return Promise.resolve();
  }

  public connectEagerly(): Promise<void> | void {
    return Promise.resolve();
  }

  public resetState(): Promise<void> | void {
    return Promise.resolve();
  }

  public deactivate(): Promise<void> | void {
    return Promise.resolve();
  }
}

export interface IMockConnectorHooksArgs {
  accounts?: string[];
  chainId?: number;
  ensNames?: string[];
  error?: Error;
  isActivating?: boolean;
  isActive?: boolean;
  provider?: unknown;
}

export const createMockConnectorHooks = ({
  accounts = [],
  ensNames = [],
  isActivating = false,
  isActive = false,
  chainId,
  provider,
}: IMockConnectorHooksArgs): Web3ReactHooks => ({
  useAccount: (): string | undefined => accounts[0],
  useAccounts: (): string[] => accounts,
  useChainId: (): number | undefined => chainId,
  useENSName: (): string | undefined => ensNames[0],
  useENSNames: (): string[] => ensNames,
  useIsActivating: (): boolean => isActivating,
  useIsActive: (): boolean => isActive,
  // eslint-disable-next-line
  // @ts-ignore
  useProvider: (): unknown | undefined => provider,
});

export const [mockConnector] = initializeConnector<MockConnector>((actions) => new MockConnector(actions));
