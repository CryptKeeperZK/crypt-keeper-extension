# `cryptkeeper.getConnectedIdentity()`

Retrieves the connected identity metadata.

&#x20;[@src/providers/sdk/CryptKeeperInjectedProvider.ts](https://github.com/CryptKeeperZK/crypt-keeper-extension/blob/29b211bae48573f0212ce280fdcc2c4a5932394b/packages/providers/src/sdk/CryptKeeperInjectedProvider.ts#L186-L195)
```ts
/**
   * Retrieves the connected identity.
   *
   * @returns {Promise<IConnectedIdentity>} A Promise that resolves to the connected identity.
   */
  async getConnectedIdentity(): Promise<ConnectedIdentityMetadata | undefined> {
    return this.post({
      method: RPCAction.GET_CONNECTED_IDENTITY_DATA,
    }) as Promise<ConnectedIdentityMetadata>;
  }

```

## Usage

```ts
import { cryptkeeperConnect, type CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";

const client = await cryptkeeperConnect();
const { name, urlOrigin } = await client.getConnectedIdentity();
```