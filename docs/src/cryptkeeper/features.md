# ✨ Features

The following features are supported currently:

* Identity secret and Identity commitment generation
* Semaphore ZK-Proof generation
* RLN ZK-Proof generation

Proof generation is enabled in two ways:

* by providing Merkle witness (Merkle tree components) directly as a [structured input](https://github.com/privacy-scaling-explorations/crypt-keeper-extension/blob/817ec0e1f336ab61c9c70f4918853e7c279dd21d/src/types/index.ts#L56):&#x20;
* by providing a secure service (i.e. smart contract) address from which the Merkle witness should be obtained
