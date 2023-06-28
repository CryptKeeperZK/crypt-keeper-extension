`@cryptkeeperzk/providers`

CryptKeeper injected providers to allow applications easily connect and communicate with CryptKeeper browser extension.

# Usage

- Inside CryptKeeper browser extension InjectedScript.

```ts
// Inside
import { initializeInjectedProvider, CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";

// Initialize window.cryptkeeper
const injectedClient = await initializeInjectedProvider();

window.cryptkeeper = injectedClient;
```

- Inside an application to communicate with CryptKeeper.

```ts
import type { CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";

console.log(window.cryptkeeper);
```
