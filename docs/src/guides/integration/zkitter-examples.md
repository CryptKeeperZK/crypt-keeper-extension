# 🐰 Zkitter examples

[Zkitter](https://www.zkitter.com/explore/) is an example of how a live dapp integrates with CryptKeeper and connects to the extension. &#x20;

The `connectZKPR` function connects to an existing identity by using the `zkpr.connect()` method. The returned client is then used to instantiate a new `ZKPR` object. Then it listens for events such as `logout` and `identityChanged` and dispatches actions accordingly.

```typescript
export const connectZKPR =
  () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => AppRootState) => {
    dispatch(setLoading(true));


    try {
      let id: Identity | null = null;


      // @ts-ignore
      if (typeof window.zkpr !== 'undefined') {
        // @ts-ignore
        const zkpr: any = window.zkpr;
        const client = await zkpr.connect();
        const zkprClient = new ZKPR(client);


        zkprClient.on('logout', async data => {
          const {
            worker: { selected, identities },
          } = getState();


          dispatch(disconnectZKPR());


          const [defaultId] = identities;
          if (defaultId) {
            postWorkerMessage(
              selectIdentity(
                defaultId.type === 'gun' ? defaultId.publicKey : defaultId.identityCommitment
              )
            );
          } else {
            postWorkerMessage(setIdentity(null));
          }
        });


        zkprClient.on('identityChanged', async data => {
          const idCommitment = data && BigInt('0x' + data).toString();
          const {
            worker: { identities },
          } = getState();


          dispatch(setIdCommitment(''));


          if (idCommitment) {
            // @ts-ignore
            dispatch(setIdCommitment(idCommitment));
            // @ts-ignore
            const id: any = await maybeSetZKPRIdentity(idCommitment);
            if (!id) {
              const [defaultId] = identities;
              if (defaultId) {
                postWorkerMessage(
                  selectIdentity(
                    defaultId.type === 'gun' ? defaultId.publicKey : defaultId.identityCommitment
                  )
                );
              } else {
                postWorkerMessage(setIdentity(null));
              }
            }
          }
        });


        localStorage.setItem('ZKPR_CACHED', '1');


        const idCommitmentHex = await zkprClient.getActiveIdentity();
        const idCommitment = idCommitmentHex && BigInt('0x' + idCommitmentHex).toString();


        if (idCommitment) {
          dispatch(setIdCommitment(idCommitment));
          id = await maybeSetZKPRIdentity(idCommitment);
        }


        dispatch(setZKPR(zkprClient));
      }


      dispatch(setLoading(false));


      return id;
    } catch (e) {
      dispatch(setLoading(false));
      throw e;
    }
  };
```

{% embed url="https://github.com/zkitter/ui/blob/main/src/ducks/zkpr.ts#L45-L126" %}

&#x20;

&#x20;

An example of how Zkitter generates proofs:&#x20;

```typescript
    const identityPathIndex = merkleProof!.pathIndices;

    if (
      !identityCommitment ||
      !identityPathElements ||
      !identityPathIndex ||
      !identityTrapdoor ||
      !identityNullifier
    ) {
      return null;
    }

    const { messageId, hash, ...json } = post.toJSON();

    const epoch = getEpoch();
    const externalNullifier = genExternalNullifier(epoch);
    const signal = messageId;
    const rlnIdentifier = await sha256('zkpost');
    const xShare = RLN.genSignalHash(signal);
    const witness = RLN.genWitness(
      identitySecretHash!,
      merkleProof!,
      externalNullifier,
      signal,
      BigInt('0x' + rlnIdentifier)
    );
    const { proof, publicSignals } = await RLN.genProof(
      witness,
      `${config.indexerAPI}/circuits/rln/wasm`,
      `${config.indexerAPI}/circuits/rln/zkey`
    );
```

{% embed url="https://github.com/zkitter/ui/blob/main/src/ducks/drafts.ts#L139-L169" %}

&#x20;&#x20;

An example of how Zkitter verifies proofs:&#x20;

```typescript
    if (result) {
      logger.debug('post already exist', {
        messageId,
        origin: 'gun',
      });
      return;
    }


    if (!creator && !data) {
      return;
    }


    try {
      if (data) {
        const proof = JSON.parse(data.proof);
        const publicSignals = JSON.parse(data.publicSignals);


        let verified = false;


        if (!data.x_share) {
          verified = await Semaphore.verifyProof(vKey as any, {
            proof,
            publicSignals,
          });


          if (!verified) return;
        } else {
          verified = await this.call('zkchat', 'verifyRLNProof', {
            epoch: data.epoch,
            proof,
            publicSignals,
            x_share: data.x_share,
          });
```

{% embed url="https://github.com/zkitter/zkitterd/blob/main/src/services/gun.ts#L277-L305" %}



&#x20;
