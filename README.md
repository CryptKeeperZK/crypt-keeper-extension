<p align="center">
<img width="128" alt="CryptKeeper logo" src="./packages/app/src/static/icons/icon-128.png">
</p>
<p align="center">
<a rel="noreferrer noopener" target="blank" href="https://addons.mozilla.org/firefox/addon/cryptkeeper/"><img alt="Firefox Add-ons" src="https://img.shields.io/badge/Firefox-141e24.svg?&style=for-the-badge&logo=firefox-browser"></a>  
</p>

<h1 align="center">Crypt-Keeper (Beta Version)</h1>

<br/>
<p align="center">CryptKeeper is an <strong>open-source</strong> MIT-licensed <strong>browser extension</strong> which enables <strong>Zero-Knowledge</strong> identity management and proof generation.
Currently it supports operations for <strong><a href="https://semaphore.appliedzkp.org/">Semaphore</a></strong> gadgets.</p>
<br/>

> Please note that this extension is currently in **beta** testing. It may not have full functionality or stability. Your participation and feedback will greatly assist us in refining and enhancing the extension.

<br/>

> [![Video](https://img.youtube.com/vi/8nrggpxbJu8/maxresdefault.jpg)](https://youtu.be/8nrggpxbJu8)
> YouTube: CryptKeeper Demo

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Development](#development)

## Description

**CryptKeeper** is a browser extension that offers secure and private identity management and authentication solutions based on zero-knowledge proofs. The `@cryptkeeperzk/providers` package simplifies the integration of CryptKeeper functionality into applications by providing injected providers.

These injected providers allow applications to establish a connection with the CryptKeeper extension, enabling them to leverage its features and services. The package includes functions for initializing the CryptKeeper provider within the browser extension's InjectedScript and for connecting to **CryptKeeper** from an application.

## Features

1. **Identity Secret and Identity Commitment Generation:** Generate Semaphore identity secrets and commitments securely. 
2. **Seamless Connection with Semaphore Identity:** Connect seamlessly with your Semaphore identity when interacting with websites and online services. 
3. **Semaphore Zero-Knowledge Proof (ZK-Proof) Generation:**  Generate Zero-Knowledge Proofs using the Semaphore library. ZK-Proofs enable you to validate the authenticity of data and assertions without revealing any sensitive information. This feature enhances privacy and security in various cryptographic applications.
4. **Rate-Limiting Nullifier (RLN) Zero-Knowledge Proof (ZK-Proof) Generation:**  Generate Zero-Knowledge Proofs using the RLN JS library. RLN is a zk-gadget/protocol that enables spam prevention in anonymous environments.
 
### Enabling Proof Generation:
Proof generation in the Semaphore library can be enabled in two ways:

1. **Providing Merkle Witness Directly:** You can generate a proof by directly providing the necessary Merkle witness. This allows you to use pre-computed witness data.
2. **Using a Secure Service Address:** by providing a secure service address from which the merkle witness should be obtained

# Development
To set up the development environment, follow these steps:

1. `pnpm install`
2. `pnpm run dev`
3. Load the `dist` directory as an unpacked extension in your browser.

### Demo

To run the demo, follow these steps:

1. `pnpm run dev` or `pnpm run build`
2. `pnpm run merkle:start`
3. `pnpm run demo:start`

### End-to-End Testing

To run end-to-end tests, follow these steps:

1. Run `pnpx playwright install --with-deps chromium` to install playwright dependencies
2. Run `pnpm install` for extension and for demo
3. Make sure you have `.env.test` file with `METAMASK_EXTENSION_ID`.
4. `METAMASK_EXTENSION_ID` can be found in log output for `pnpm run e2e`. For different environments `METAMASK_EXTENSION_ID` is also different so we need to specify it explicitly.
5. Run `pnpm run build:e2e` to build the extension
6. Run `pnpm run e2e` to run playwright e2e tests
