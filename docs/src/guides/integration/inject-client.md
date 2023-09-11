# 🎯 Inject client

CryptKeeper injects an object called `zkpr` into the browser. This is similar to how

MetaMask injects a [global API](https://docs.metamask.io/guide/ethereum-provider.html#ethereum-provider-api) into websites visited by its users at `window.ethereum` (formerly [window.web3](https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3))

The injected client serves as bridge between frontend and backend processes. It is passed into the web page by the extension through an API allows the web page to make calls to CryptKeeper. From here you can manually generate and verify proofs, create identities, and set permissions.

You should be able to access the injected client’s functions and permissions once connected:

* `getIdentityCommitments`: Retrieves the commitments of the current identity.
* `getActiveIdentity`: Retrieves the currently active identity.
* `getHostPermissions`: Retrieves the permissions for the specified host.
* `setHostPermissions`: Sets the permissions for the specified host.
* `createIdentity`: Creates a new identity and returns the result.
* `createDummyRequest`: Creates a dummy request and returns the result.
* `semaphoreProof`: Sends a Semaphore proof request and returns the result.
* `rlnProof`: Sends a RLN proof request and returns the result.
* `clearApproved`: Clears the approved list of requests.
* `getApproved`: Retrieves the approved list of requests.
* `openPopup`: Opens the extension's popup window.
* `closePopup`: Closes the extension's popup window.
* `post`: Sends a request to the extension and returns the result.

[@src/contentscripts/injected.ts](https://github.com/privacy-scaling-explorations/crypt-keeper-extension/blob/817ec0e1f336ab61c9c70f4918853e7c279dd21d/src/contentscripts/injected.ts)

```typescript
const client = {
    openPopup,
    getIdentityCommitments,
    getActiveIdentity,
    createIdentity,
    getHostPermissions,
    setHostPermissions,
    semaphoreProof,
    rlnProof,
    on,
    off,
    // dev-only
    clearApproved,
    createDummyRequest
}

```

