# Description (WIP)

ZK-Keeper is a browser plugin which enables Zero knowledge identity management and proof generation.
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

1. `npm run dev`
2. `npm run merkle`
3. `npm run serve`
4. `cd demo && npm run demo`

To run the demo and generate proofs, you additionally need the circuit files for Semaphore and RLN. For compatible Semaphore and RLN zk files you can use the following [link](https://drive.google.com/file/d/1Yi14jwly70VwMSuqJrPCc3j15MWeE7mc/view?usp=sharing).
Please extract the files into a directory named `zkeyFiles` at the root of this repository.