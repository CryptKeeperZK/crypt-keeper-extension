# 🔌 Connect

## Connect to extension

Use `cryptkeeper.connect` to access the extension.

Initialize the `cryptkeeper.connect` function, which returns a promise that resolves to the client object.

&#x20;Once you have the client object, you can use it to make RPC calls to the extension.

&#x20;[@src/providers/sdk/CryptKeeperInjectedProvider.ts](https://github.com/CryptKeeperZK/crypt-keeper-extension/blob/29b211bae48573f0212ce280fdcc2c4a5932394b/packages/providers/src/sdk/CryptKeeperInjectedProvider.ts#L105-L125)


```ts
 /**
   * Connects to the CryptKeeper extension.
   *
   * @returns {Promise<CryptKeeperInjectedProvider | undefined>} A Promise that resolves to the connected CryptKeeperInjectedProvider instance, or undefined if the CryptKeeper extension is not installed.
   */
  async connect(): Promise<CryptKeeperInjectedProvider | undefined> {
    if (!window.isCryptkeeperInjected) {
      return undefined;
    }

    const { isApproved, canSkipApprove } = await this.tryConnect(window.location.origin);

    if (isApproved) {
      await this.addHost(window.location.origin, canSkipApprove);
    }

    await this.post({ method: RPCAction.CLOSE_POPUP });

    const connectedIdentity = await this.getConnectedIdentity();

    if (!connectedIdentity) {
      await this.connectIdentity({ host: window.location.origin });
    }

    return this;
  }

    declare global {
        interface Window {
            zkpr: {
                connect: () => any
            }
        }
    }// Some code
```
