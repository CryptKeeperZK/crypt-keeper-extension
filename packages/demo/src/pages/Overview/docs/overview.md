# What is CryptKeeper?

Welcome to CryptKeeper browser extension, a simple, easy to use, and secure ZK identity and proof manager browser wallet.

> Please note that this extension is currently in **beta** testing. It may not have full functionality or stability. Your participation and feedback will greatly assist us in refining and enhancing the extension.

## 💡 Overview

**CryptKeeper** is a browser extension that offers secure and private identity management and authentication solutions based on zero-knowledge proofs. The `@cryptkeeperzk/providers` package simplifies the integration of CryptKeeper functionality into applications by providing injected providers.

These injected providers allow applications to establish a connection with the CryptKeeper extension, enabling them to leverage its features and services. The package includes functions for initializing the CryptKeeper provider within the browser extension's InjectedScript and for connecting to **CryptKeeper** from an application.

## ✨ Features

1. **Identity Secret and Identity Commitment Generation:** Generate Semaphore identity secrets and commitments securely.

2. **Seamless Connection with Semaphore Identity:** Connect seamlessly with your Semaphore identity when interacting with websites and online services.

3. **Semaphore Zero-Knowledge Proof (ZK-Proof) Generation:** Generate Zero-Knowledge Proofs using the Semaphore library. ZK-Proofs enable you to validate the authenticity of data and assertions without revealing any sensitive information. This feature enhances privacy and security in various cryptographic applications.

4. **Rate-Limiting Nullifier (RLN) Zero-Knowledge Proof (ZK-Proof) Generation:** Generate Zero-Knowledge Proofs using the RLN JS library. RLN is a zk-gadget/protocol that enables spam prevention in anonymous environments.

### Enabling Proof Generation:

Proof generation in the Semaphore library can be enabled in two ways:

1. **Providing Merkle Witness Directly:** You can generate a proof by directly providing the necessary Merkle witness. This allows you to use pre-computed witness data.

2. **Using a Secure Service Address:** by providing a secure service address from which the Merkle witness should be obtained
