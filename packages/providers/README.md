`@cryptkeeperzk/providers`

CryptKeeper injected providers to allow applications easily connect and communicate with CryptKeeper browser extension. 

# Usage
```ts
import { initializeInjectedProvider, CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";

// Initialize window.cryptkeeper
const injectedClient = await initializeInjectedProvider().connect();
```