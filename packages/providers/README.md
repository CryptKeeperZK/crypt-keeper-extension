# `@cryptkeeperzk/providers`

The `@cryptkeeperzk/providers` package provides **CryptKeeper** injected providers that enable applications to easily connect and communicate with the CryptKeeper browser extension.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Inside CryptKeeper Browser Extension (Connector)](#inside-cryptkeeper-browser-extension-connector)
  - [Inside an Application](#inside-an-application)

## Description

**CryptKeeper** is a browser extension that offers secure and private identity management and authentication solutions based on zero-knowledge proofs. The `@cryptkeeperzk/providers` package simplifies the integration of CryptKeeper functionality into applications by providing injected providers.

These injected providers allow applications to establish a connection with the CryptKeeper extension, enabling them to leverage its features and services. The package includes functions for initializing the CryptKeeper provider within the browser extension's InjectedScript and for connecting to **CryptKeeper** from an application.

With the `@cryptkeeperzk/providers` package, developers can seamlessly integrate CryptKeeper functionality into their applications, enhancing security and privacy while benefiting from the features offered by CryptKeeper.

## Features

- **Simplified integration**: The package offers injected providers that enable applications to establish a connection with the CryptKeeper extension effortlessly.

- **Secure identity management**: CryptKeeper's zero-knowledge proof technology ensures the privacy and security of user identities, enhancing data protection.

- **Flexible communication**: Applications can leverage CryptKeeper's features and services through the provided API, enabling custom interactions tailored to specific use cases.

## Installation

Install the package using your preferred package manager:

```shell
npm install @cryptkeeperzk/providers

```

## Usage

### Inside CryptKeeper Browser Extension (Connector)

In the **CryptKeeper** browser extension's `connector/cryptkeeper`, it uses `initializeCryptKeeperProvider` function from the `@cryptkeeperzk/providers` package to initialize the CryptKeeper provider.

```ts
import { initializeCryptKeeperProvider } from "@cryptkeeperzk/providers";

const cryptkeeperInjectedProvider = initializeCryptKeeperProvider();
```

This initializes the CryptKeeper provider within the extension and allows applications to communicate with CryptKeeper seamlessly.

### Inside an Application

To connect and communicate with CryptKeeper from an external application, use the `cryptkeeperConnect` function from @cryptkeeperzk/providers:

```ts
import { cryptkeeperConnect, type CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";

const cryptkeeperClient = await cryptkeeperConnect();
```

The `cryptkeeperConnect` function establishes a connection with CryptKeeper and returns a CryptKeeperInjectedProvider instance if CryptKeeper is installed, or undefined otherwise. You can await the function call to ensure the connection is established before proceeding with further operations.
