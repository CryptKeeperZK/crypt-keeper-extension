<p align="center">
<img width="128" alt="Dark Reader's mascot" src="./src/static/icons/icon-128.png">
</p>
<p align="center">
<a rel="noreferrer noopener" href="https://addons.mozilla.org/firefox/addon/cryptkeeper/"><img alt="Firefox Add-ons" src="https://img.shields.io/badge/Firefox-141e24.svg?&style=for-the-badge&logo=firefox-browser"></a>  
</p>

<h1 align="center">Crypt-Keeper</h1>

<br/>
<p align="center">CryptKeeper is an <strong>open-source</strong> MIT-licensed <strong>browser extension</strong> which enables <strong>Zero-Knowledge</strong> identity management and proof generation.
Currently it supports operations for <strong><a href="https://semaphore.appliedzkp.org/">Semaphore</a></strong> gadgets.</p>
<br/>
<br/>

> [![Video](https://img.youtube.com/vi/8nrggpxbJu8/maxresdefault.jpg)](https://youtu.be/8nrggpxbJu8)
> YouTube: CryptKeeper Demo

# Supported Features

- Semaphore Identity secret and Identity commitment generation.
- Connecting with your semaphore identity to a website.
- Semaphore ZK-Proof generation.

### Proof generation is enabled in two ways:

- by providing merkle witness directly
- by providing a secure service address from which the merkle witness should be obtained

# Development

1. `pnpm install`
2. `pnpm run dev`
3. Load the dist directory as an unpacked extension from your browser.

### Demo

1. `pnpm run dev` or `pnpm run build`
2. `pnpm run merkle`
3. `cd demo && pnpm install && pnpm run start`

### E2E

1. Run `pnpx playwright install --with-deps chromium` to install playwright dependencies
2. Run `pnpm install` for extension and for demo
3. Make sure you have `.env.test` file with `METAMASK_EXTENSION_ID`.
4. `METAMASK_EXTENSION_ID` can be found in log output for `pnpm run e2e`. For different environments `METAMASK_EXTENSION_ID` is also different so we need to specify it explicitly.
5. Run `pnpm run build:e2e` to build the extension
6. Run `pnpm run e2e` to run playwright e2e tests
