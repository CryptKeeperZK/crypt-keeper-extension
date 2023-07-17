import { ethers } from "ethers";
import { MemoryCache, RLN, Status } from "test-rlnjs";
import { deployERC20, deployRLNContract, deployVerifier, treeDepth, url } from "./configs";


async function main() {
    const rlnIdentifier = BigInt(5566)
    const messageLimit = BigInt(1);
    const message0 = "Hello World"
    const message1 = "Hello World 2"
    const epoch = BigInt(1234)
    const signerTestERC20Amount = BigInt(100000000)
    const slasher = "0x0000000000000000000000000000000000009876"

    const rlnContractArgs = {
        minimalDeposit: BigInt(100),
        treeDepth: treeDepth,
        feePercentage: BigInt(10),
        feeReceiver: "0x0000000000000000000000000000000000006789",
        freezePeriod: BigInt(1),
    }
    console.log(`Connecting to endpoint at ${url}`)
    const provider = new ethers.JsonRpcProvider(url)
    const signer = await provider.getSigner(0)
    // Here we use a mock verifier since we don't have a proof verifier deployed yet.
    console.log(`Deploying contracts...`)
    const verifierContract = await deployVerifier(signer)
    console.log(`Deployed mock verifier at ${await verifierContract.getAddress()}`)
    const erc20Contract = await deployERC20(signer, signerTestERC20Amount)
    console.log(`Deployed test ERC20 at ${await erc20Contract.getAddress()}`)
    const rlnContract = await deployRLNContract(
        signer,
        await erc20Contract.getAddress(),
        await verifierContract.getAddress(),
        rlnContractArgs.minimalDeposit,
        rlnContractArgs.treeDepth,
        rlnContractArgs.feePercentage,
        rlnContractArgs.feeReceiver,
        rlnContractArgs.freezePeriod,
    )
    const rlnContractAddress = await rlnContract.getAddress()
    const rlnContractAtBlock = await provider.getBlockNumber()
    console.log(`Deployed RLN contract at ${rlnContractAddress} at block ${rlnContractAtBlock}`)

    function createRLNInstance() {
        return RLN.createWithContractRegistry({
            /* Required */
            rlnIdentifier,
            provider,
            contractAddress: rlnContractAddress,
            /* Optional */
            contractAtBlock: rlnContractAtBlock,
            signer,
        })
    }

    async function mineBlocks(numBlocks: number) {
        provider.send("hardhat_mine", ["0x" + numBlocks.toString(16)])
    }

    const rln = createRLNInstance()
    console.log(`rln created: identityCommitment=${rln.identityCommitment}`)
    if (await rln.isRegistered()) {
        throw new Error(`rln should not have yet registered`);
    }
    console.log(`Try with rate limit ${messageLimit}...`)

    /* Register */

    await rln.register(messageLimit);
    if (!await rln.isRegistered()) {
        throw new Error(`Failed to register`);
    }
    console.log(`Successfully registered`);

    /* Create Proof */
    console.log(`Creating proof...`)
    const proof = await rln.createProof(epoch, message0);
    if (!await rln.verifyProof(epoch, message0, proof)) {
        throw new Error(`Proof is invalid`);
    }
    console.log(`Successfully created proof`);
    console.log(`Try creating proof for another message but it should exceed the rate limit ${messageLimit}...`)
    try {
        await rln.createProof(epoch, message1);
    } catch (e) {
        const message = (e as Error).toString()
        if (!message.includes(`Error: Message ID counter exceeded message limit ${messageLimit}`)) {
            throw e
        }
    }
    console.log(`Failed to create proof for another message as expected`);

    /* Withdraw */
    console.log("`withdraw`...")
    await rln.withdraw();

    // wait after freeze period
    const blockHeightFreezePeriodEnds = Number(rlnContractArgs.freezePeriod) + 1
    console.log("Wait after freeze period ends (freezePeriod + 1 blocks)...")
    await mineBlocks(blockHeightFreezePeriodEnds)

    console.log("`releaseWithdrawal`...")
    await rln.releaseWithdrawal();
    if (await rln.isRegistered()) {
        throw new Error(`Failed to withdraw`);
    }
    console.log(`Successfully withdrew`);

    /* Slash */

    console.log("Try `slash` by making rlnAnother create more than " + `${messageLimit} proofs and get slashed by rln`)
    class ResettableCache extends MemoryCache {
        async reset() {
            this.cache = {}
        }
    }
    const resettableCache = new ResettableCache()
    const rlnAnother = createRLNInstance()
    rlnAnother.setCache(resettableCache)
    console.log(`rlnAnother created: identityCommitment=${rlnAnother.identityCommitment}`)
    class FaultyMessageIDCounter {
        private counter: bigint = BigInt(0)
        constructor(readonly messageLimit: bigint) { }
        async getMessageIDAndIncrement(_: bigint): Promise<bigint> {
            // Don't increment counter, so that it will exceed the message limit
            return this.counter
        }
        async peekNextMessageID(_: bigint): Promise<bigint> {
            return BigInt(this.counter)
        }
    }
    console.log(`Registering rlnAnother...`)
    // Intentionally uses a faulty message ID counter, so that it will use the same message ID
    // and exceed the message limit. This will cause it to get slashed.
    await rlnAnother.register(messageLimit, new FaultyMessageIDCounter(messageLimit));
    console.log(`Creating proof0 for rlnAnother...`)
    const proof0 = await rlnAnother.createProof(epoch, message0);
    console.log(`Creating proof1 for rlnAnother...`)
    // Intentionally clear the cache of rlnAnother, so that it will create a proof which
    // will cause a breach and get slashed.
    resettableCache.reset()
    const proof1 = await rlnAnother.createProof(epoch, message1);
    console.log(`rln saving proof0 from rlnAnother...`)
    const res0 = await rln.saveProof(proof0);
    if (res0.status != Status.VALID) {
        throw new Error(`rlnAnother's proof should have been valid`);
    }
    console.log(`rln saving proof1 for rlnAnother...`)
    const res1 = await rln.saveProof(proof1);
    if (res1.status != Status.BREACH) {
        throw new Error(`rlnAnother's secret should have been breached`);
    }
    const secret = res1.secret as bigint
    console.log(`Successfully breached rlnAnother's secret=${secret}`);
    await rln.slash(secret, slasher)
    if (await rlnAnother.isRegistered()) {
        throw new Error(`rlnAnother should have been slashed`);
    }
    console.log(`Successfully slashed rlnAnother`);
    RLN.cleanUp()
}

main().catch((e) => {
    console.error(e)
});
