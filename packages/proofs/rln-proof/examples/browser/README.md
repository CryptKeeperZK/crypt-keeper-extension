# Example: use RLNjs in browser

The example go through the following steps:
1. Deploy the necessary contracts: verifier (the mock proof verifier since it's not yet generated), ERC20 token, and the RLN contract
2. Create a RLN instance `rln`, and demonstrate how to `register`, `createProof`, `verifyProof`, `withdraw`, and `releaseWithdrawal`.
3. Create a RLN instance `rlnAnother` and demonstrate how to slash a spammer. `rlnAnother` simply `register` and send more proofs than they should. `rln` can detect the spam by examine the output from `saveProof`. If the status of the output is BREACH, the secret is leaked. `rln` can use the recovered secret to slash the spammer by calling `slash`.

To install and run the example, follow the steps below.

1. Install the project
```bash
$ npm install
```

2. Run a local testing RPC
Here we use a hardhat node. If the RPC is not listening `http://localhost:8545`, you need to change the `url` in [config.ts](./src/configs.ts).

In a new terminal, run:
```bash
$ npx hardhat node
```

3. Run the web server
```bash
$ npm run test


...
Available on:
  http://127.0.0.1:8080
  http://192.168.50.66:8080
Hit CTRL-C to stop the server
```

4. Open the web page at `http://localhost:8080`. You should see the following output in the browser console.
```
Connecting to endpoint at http://localhost:8545
Deploying contracts...

...

Successfully breached rlnAnother's secret=xxx
Successfully slashed rlnAnother
```

