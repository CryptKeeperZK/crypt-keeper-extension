<p align='center'>
    <img src='./src/static/icons/logo.png' alt='screenshot' />
</p>

# CryptKeeper Browser Extension

CryptKeeper is a browser extension which enables Zero knowledge identity management and proof generation.
Currently it supports operations for Semaphore and RLN gadgets.

This plugin is still in development phase.

The following features are supported currently:

- Identity secret and Identity commitment generation
- Semaphore ZK-Proof generation
- RLN ZK-Proof generation

The plugin uses the [zk-kit library](https://github.com/appliedzkp/zk-kit).

Proof generation is enabled in two ways:

- by providing merkle witness directly
- by providing a secure service address from which the merkle witness should be obtained

# Development

1. `npm install`
2. `npm run dev`
3. Load the dist directory as an unpacked extension from your browser.

# Demo

1. `npm run build`
2. `npm run merkle`
3. `cd demo && npm install && npm run start`

# E2E

1. Run `npx playwright install --with-deps chromium` to install playwright dependencies
2. Run `npm install` for extension and for demo
3. Make sure you have `.env.test` file with `METAMASK_EXTENSION_ID`.
4. `METAMASK_EXTENSION_ID` can be found in log output for `npm run e2e`. For different environments `METAMASK_EXTENSION_ID` is also different so we need to specify it explicitly.
5. Run `npm run build:e2e` to build the extension
6. Run `npm run e2e` to run playwright e2e tests
