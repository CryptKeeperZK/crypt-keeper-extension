import { initializeCryptKeeperProvider, ICryptKeeperInjectedProvider, EventName } from "@cryptkeeperzk/providers";
import { initializeConnector } from "@web3-react/core";
import { Connector } from "@web3-react/types";

import { RPCInternalAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

type CancelActivation = () => void;

export class CryptkeeperConnector extends Connector {
  private eagerConnection?: Promise<void>;

  customProvider?: ICryptKeeperInjectedProvider;

  async activate(): Promise<void> {
    let cancelActivation: CancelActivation | undefined;

    if (!this.customProvider?.isCryptKeeper) {
      cancelActivation = this.actions.startActivation();
    }

    return this.initialize()
      .then(async () => {
        if (!this.customProvider) {
          throw new Error("No CryptKeeper extension installed");
        }

        const accounts = await this.loadAccounts();
        this.actions.update({ accounts });
      })
      .catch((error) => {
        cancelActivation?.();
        throw error;
      });
  }

  async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();

    try {
      await this.initialize();

      if (!this.customProvider?.isCryptKeeper) {
        cancelActivation();
        return;
      }

      const accounts = await this.loadAccounts();
      this.actions.update({ accounts });
    } catch (error) {
      cancelActivation();
      this.actions.resetState();
    }
  }

  private async initialize(): Promise<void> {
    if (this.eagerConnection) {
      return undefined;
    }

    this.customProvider = initializeCryptKeeperProvider();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.eagerConnection = this.customProvider?.connect().then(() => {
      this.customProvider?.on(EventName.LOGIN, async () => {
        const accounts = await this.loadAccounts();
        this.actions.update({ accounts });
      });

      this.customProvider?.on(EventName.LOGOUT, () => {
        this.actions.resetState();
      });
    });

    return this.eagerConnection;
  }

  // TODO: create web3 provider
  private async loadAccounts(): Promise<string[]> {
    return postMessage<string[]>({ method: RPCInternalAction.GET_ACCOUNTS });
  }
}

export const [cryptKeeper, cryptKeeperHooks] = initializeConnector<CryptkeeperConnector>(
  (actions) => new CryptkeeperConnector(actions),
);
