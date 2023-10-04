# 🆔 Create identity

By default, CryptKeeper uses either its supported internal ethereum wallet, or an external wallet like MetaMask (and still the only supported external wallet) to create a new Semaphore Identity.

1. In CryptKeeper/MetaMask wallet, a user signs a message with the private key of their Ethereum account.
2. In your DApp, the user creates a deterministic identity with the signed message.
3. The user can now recreate their Semaphore identity whenever they want by signing the same message with their Ethereum account in CryptKeeper/MetaMask wallet.

&#x20;[@src/providers/sdk/CryptKeeperInjectedProvider.ts](https://github.com/CryptKeeperZK/crypt-keeper-extension/blob/29b211bae48573f0212ce280fdcc2c4a5932394b/packages/providers/src/sdk/CryptKeeperInjectedProvider.ts#L197-L210)

```ts
  /**
   * Connects to an existing identity for the specified urlOrigin.
   *
   * @param {IConnectIdentityRequestArgs} urlOrigin - The urlOrigin for which to connect to an identity.
   * @returns {Promise<void>} A Promise that resolves when the connection is complete.
   */
  async connectIdentity({ urlOrigin }: IConnectIdentityRequestArgs): Promise<void> {
    await this.post({
      method: RPCAction.CONNECT_IDENTITY_REQUEST,
      payload: {
        urlOrigin,
      },
    });
  }
```

## Usage

```ts
import { cryptkeeperConnect, type CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";

const client = await cryptkeeperConnect();
await client.connectIdentity();
```
