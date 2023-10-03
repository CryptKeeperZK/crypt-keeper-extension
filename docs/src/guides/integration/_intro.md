# 🧩 Integrations

In order to connect your application with CryptKeeper Browser Extension, you would need to install CryptKeeper npm provider package. The `@cryptkeeperzk/providers` package simplifies the integration of CryptKeeper functionality into applications by providing injected providers.

These injected providers allow applications to establish a connection with the CryptKeeper extension, enabling them to leverage its features and services. The package includes functions for initializing the CryptKeeper provider within the browser extension's InjectedScript and for connecting to CryptKeeper from an application.

With the `@cryptkeeperzk/providers` package, developers can seamlessly integrate CryptKeeper functionality into their applications, enhancing security and privacy while benefiting from the features offered by CryptKeeper.

## 🔧 Installation

Install the package using your preferred package manager:
```bash
npm install @cryptkeeperzk/providers
```

## 📖 Usage

### Inside an Application

To connect and communicate with CryptKeeper from an external application, use the `cryptkeeperConnect` function from `@cryptkeeperzk/providers`:

```ts
import { cryptkeeperConnect, type CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";

const client = await cryptkeeperConnect();
```
The `cryptkeeperConnect` function establishes a connection with CryptKeeper and returns a `CryptKeeperInjectedProvider` instance if CryptKeeper is installed, or undefined otherwise. You can await the function call to ensure the connection is established before proceeding with further operations.


## 🎯 Injected client

CryptKeeper injects a client object called `cryptkeeper` into the browser. This is similar to how MetaMask injects a [global API](https://docs.metamask.io/guide/ethereum-provider.html#ethereum-provider-api) into websites visited by its users at `window.ethereum` (formerly [window.web3](https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3)). 

The injected client serves as bridge between frontend and backend processes. It is passed into the web page by the extension through an API allows the web page to make calls to CryptKeeper. From here you can manually generate and verify proofs, create identities, and set permissions.

You should be able to access the injected client’s functions and permissions once connected:

* `connect`: Retrieves the currently active identity.

* `getConnectedIdentity`: Retrieves the connected identity.
[@src/contentscripts/injected.ts](https://github.com/CryptKeeperZK/crypt-keeper-extension/blob/29b211bae48573f0212ce280fdcc2c4a5932394b/packages/providers/src/sdk/CryptKeeperInjectedProvider.ts#L191-195)

```ts
// Example
const { name, urlOrigin } = await client.getConnectedIdentity()
```

* `getHostPermissions`: Retrieves the permissions for the specified urlOrigin.
* `setHostPermissions`: Sets the permissions for the specified urlOrigin.
* `createIdentity`: Creates a new identity and returns the result.
* `createDummyRequest`: Creates a dummy request and returns the result.
* `semaphoreProof`: Sends a Semaphore proof request and returns the result.
* `rlnProof`: Sends a RLN proof request and returns the result.
* `clearApproved`: Clears the approved list of requests.
* `getApproved`: Retrieves the approved list of requests.
* `openPopup`: Opens the extension's popup window.
* `closePopup`: Closes the extension's popup window.
* `post`: Sends a request to the extension and returns the result.

