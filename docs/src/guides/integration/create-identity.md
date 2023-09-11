# 🆔 Create identity

By default, CryptKeeper uses MetaMask to create a new Semaphore Identity \[link].

1. In MetaMask, a user signs a message with the private key of their Ethereum account.
2. In your dapp, the user creates a deterministic identity \[link] with the signed message.
3. The user can now recreate their Semaphore identity whenever they want by signing the same message with their Ethereum account in Metamask.

Semaphore identities can also be created using other data (such as web2 reputations from [Interep](https://interep.link/)) or using random numbers.

[@src/background/zk-keeper.ts](https://github.com/privacy-scaling-explorations/crypt-keeper-extension/blob/master/src/background/zk-keeper.ts)

```typescript
this.add(
            RPCAction.CREATE_IDENTITY,
            LockService.ensure,
            async (payload: NewIdentityRequest) => {
                try {
                    const { strategy, messageSignature, options } = payload
                    if (!strategy) throw new Error('strategy not provided')

                    const numOfIdentites = await this.identityService.getNumOfIdentites()
                    const config: any = {
                        ...options,
                        name: options?.name || `Account # ${numOfIdentites}`
                    }

                    if (strategy === 'interrep') {
                        console.log("CREATE_IDENTITY: 1")
                        config.messageSignature = messageSignature;
                        console.log("CREATE_IDENTITY: 2")
                    }

                    const identity: ZkIdentityWrapper | undefined = await identityFactory(strategy, config)
                    console.log("CREATE_IDENTITY: 4", identity);

                    if (!identity) {
                        throw new Error('Identity not created, make sure to check strategy')
                    }

                    await this.identityService.insert(identity)

                    return true
                } catch (error: any) {
                    console.log("CREATE_IDENTITY: Error", error);
                    throw new Error(error.message)
                }
            }
        )
```

&#x20;

1. Import the `ZkKeeperController` class and initialize an instance of it.
2. Use the `RPCAction.CREATE_IDENTITY` method, which is a function provided by the `ZkKeeperController` class, and pass in the necessary parameters as the payload. The payload should include a `strategy`, `messageSignature`, and `options` object.
3. The `strategy` parameter is a string that specifies the type of identity you want to create.
4. The `messageSignature` parameter is a string that is the signature of some message that is used to verify the authenticity of the client.
5. The `options` object contains additional options for creating the identity including an `identityName` field which is a string that sets the name of the newly created identity.
6. The function returns a promise that resolves to the new identity's commitment. Once the identity is created, it can be used to generate ZK proofs
