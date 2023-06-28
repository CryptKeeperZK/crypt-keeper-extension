import { type CryptKeeperInjectedProvider, initializeInjectedProvider, RPCAction } from "@cryptkeeperzk/providers";
import { initializeConnector } from "@web3-react/core";
import { Connector } from "@web3-react/types";

import postMessage from "@src/util/postMessage";

export class CryptkeeperConnector extends Connector {
  private eagerConnection?: Promise<void>;

  customProvider?: CryptKeeperInjectedProvider;

  async activate(): Promise<void> {
    let cancelActivation: () => void;

    if (!this.customProvider?.isCryptKeeper) {
      cancelActivation = this.actions.startActivation();
    }

    return this.initialize()
      .then(async () => {
        if (!this.customProvider) {
          throw new Error("No cryptkeeper installed");
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

      if (!this.customProvider || !this.customProvider.isCryptKeeper) {
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

    this.customProvider = initializeInjectedProvider();
    this.eagerConnection = this.customProvider?.connect().then(() => {
      this.customProvider?.on("login", async () => {
        const accounts = await this.loadAccounts();
        this.actions.update({ accounts });
      });

      this.customProvider?.on("logout", () => {
        this.actions.resetState();
      });
    });

    return this.eagerConnection;
  }

  // TODO: create web3 provider
  private async loadAccounts(): Promise<string[]> {
    return postMessage<string[]>({ method: RPCAction.GET_ACCOUNTS });
  }
}

export const [cryptKeeper, cryptKeeperHooks] = initializeConnector<CryptkeeperConnector>(
  (actions) => new CryptkeeperConnector(actions),
);
