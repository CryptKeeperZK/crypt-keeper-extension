import { RLN, RLNFullProof } from "../src";
import { ICache, MemoryCache, Status } from "../src/cache";
import { rlnParams, withdrawParams } from "./configs";
import { ethers } from "ethers";
import { setupTestingContracts } from "./factories";
import { FakeMessageIDCounter, fieldFactory } from "./utils";
import { MemoryRLNRegistry } from "../src/registry";


describe("RLN", function () {
    const rlnIdentifierA = BigInt(1);
    const treeDepthWithoutDefaultParams = 5566;

    describe("constructor params", function () {
        const registry = new MemoryRLNRegistry(rlnIdentifierA, 20)

        test("should fail when neither proving params nor verification key is given", async function () {
            expect(() => {
                new RLN({
                    rlnIdentifier: rlnIdentifierA,
                    treeDepth: treeDepthWithoutDefaultParams,
                    registry,
                });
            }).toThrow(
                'Either both `wasmFilePath` and `finalZkeyPath` must be supplied to generate proofs, ' +
                'or `verificationKey` must be provided to verify proofs.'
            );
        });

        test("should fail to prove if no proving params is given as constructor arguments", async function () {
            const rln = new RLN({
                rlnIdentifier: rlnIdentifierA,
                treeDepth: treeDepthWithoutDefaultParams,
                registry,
                verificationKey: rlnParams.verificationKey,
            })
            await expect(async () => {
                await rln.createProof(BigInt(0), "abc")
            }).rejects.toThrow("Prover is not initialized");
        });

        test("should fail when verifying if no verification key is given as constructor arguments", async function () {
            const rln = new RLN({
                rlnIdentifier: rlnIdentifierA,
                treeDepth: treeDepthWithoutDefaultParams,
                registry,
                wasmFilePath: rlnParams.wasmFilePath,
                finalZkeyPath: rlnParams.finalZkeyPath,
            })
            const randomEpoch = fieldFactory()
            const randomMessage = "abc"
            const mockProof = {} as RLNFullProof
            await expect(async () => {
                await rln.verifyProof(randomEpoch, randomMessage, mockProof)
            }).rejects.toThrow("Verifier is not initialized");
        });
    });

    describe("createWithContractRegistry params", function () {
        const fakeProvider = {} as ethers.Provider
        const fakeContractAddress = "0x0000000000000000000000000000000000005678"

        test("should fail when neither proving params nor verification key is given", async function () {
            expect(() => {
                RLN.createWithContractRegistry({
                    rlnIdentifier: rlnIdentifierA,
                    treeDepth: treeDepthWithoutDefaultParams,
                    provider: fakeProvider,
                    contractAddress: fakeContractAddress,
                });
            }).toThrow(
                'Either both `wasmFilePath` and `finalZkeyPath` must be supplied to generate proofs, ' +
                'or `verificationKey` must be provided to verify proofs.'
            );
        });

        test("should fail to prove if no proving params is given as constructor arguments", async function () {
            const rln = RLN.createWithContractRegistry({
                rlnIdentifier: rlnIdentifierA,
                treeDepth: treeDepthWithoutDefaultParams,
                provider: fakeProvider,
                contractAddress: fakeContractAddress,
                verificationKey: rlnParams.verificationKey,
            })
            await expect(async () => {
                await rln.createProof(BigInt(0), "abc")
            }).rejects.toThrow("Prover is not initialized");
        });

        test("should fail when verifying if no verification key is given as constructor arguments", async function () {
            const rln = RLN.createWithContractRegistry({
                rlnIdentifier: rlnIdentifierA,
                treeDepth: treeDepthWithoutDefaultParams,
                provider: fakeProvider,
                contractAddress: fakeContractAddress,
                wasmFilePath: rlnParams.wasmFilePath,
                finalZkeyPath: rlnParams.finalZkeyPath,
            })
            const randomEpoch = fieldFactory()
            const randomMessage = "abc"
            const mockProof = {} as RLNFullProof
            await expect(async () => {
                await rln.verifyProof(randomEpoch, randomMessage, mockProof)
            }).rejects.toThrow("Verifier is not initialized");
        });

    });

    describe("functionalities", function () {
        const rlnIdentifierA = BigInt(1);
        const rlnIdentifierB = BigInt(2);

        const epoch0 = BigInt(0);
        const epoch1 = BigInt(1);
        const message0 = "abc";
        const message1 = "abcd";

        let deployed;
        let waitUntilFreezePeriodPassed: () => Promise<void>
        let killNode: () => Promise<void>

        let rlnA0: RLN;
        const messageLimitA0 = BigInt(1);
        const messageIDCounterA0 = new FakeMessageIDCounter(messageLimitA0)
        let proofA00: RLNFullProof;

        let rlnA1: RLN;
        let contractAddress: string
        const messageLimitA1 = BigInt(1);
        // Use a fake messageIDCounter which allows us to adjust reset message id for testing
        const messageIDCounterA1 = new FakeMessageIDCounter(messageLimitA1)
        const cacheA1 = new MemoryCache()
        let proofA10: RLNFullProof;
        let proofA11: RLNFullProof;

        const treeDepth = 20

        const tokenAmount = BigInt("1000000000000000000")
        // 10 token
        const minimalDeposit = BigInt(10)
        // 10%
        const feePercentage = BigInt(10)
        const feeReceiver = "0x0000000000000000000000000000000000005566"
        const freezePeriod = BigInt(1)

        function rlnInstanceFactory(args: {
            rlnIdentifier: bigint,
            signer?: ethers.Signer,
        }) {
            return RLN.createWithContractRegistry({
                wasmFilePath: rlnParams.wasmFilePath,
                finalZkeyPath: rlnParams.finalZkeyPath,
                verificationKey: rlnParams.verificationKey,
                rlnIdentifier: args.rlnIdentifier,
                provider: deployed.provider,
                signer: args.signer,
                contractAddress,
                withdrawWasmFilePath: withdrawParams.wasmFilePath,
                withdrawFinalZkeyPath: withdrawParams.finalZkeyPath,
            })
        }

        beforeAll(async () => {
            deployed = await setupTestingContracts({
                initialTokenAmount: tokenAmount,
                minimalDeposit,
                treeDepth,
                feePercentage,
                feeReceiver,
                freezePeriod,
            });
            waitUntilFreezePeriodPassed = deployed.waitUntilFreezePeriodPassed
            killNode = deployed.killNode

            contractAddress = await deployed.rlnContract.getAddress()

            rlnA0 = rlnInstanceFactory({
                rlnIdentifier: rlnIdentifierA,
                signer: deployed.signer0,
            });
            rlnA1 = rlnInstanceFactory({
                rlnIdentifier: rlnIdentifierA,
                signer: deployed.signer1,
            });
            rlnA1.setCache(cacheA1);
        });

        afterAll(async () => {
            console.log("killing node")
            await killNode()
            console.log("node killed")
        });

        test("should have correct members after initialization", async function () {
            expect(await rlnA0.isRegistered()).toBe(false);
            expect((await rlnA0.getAllRateCommitments()).length).toBe(0);
            expect(await rlnA0.getMerkleRoot()).toBe(await rlnA1.getMerkleRoot());
        });

        test("should fail when creating proof if not registered", async function () {
            await expect(async () => {
                await rlnA0.createProof(BigInt(0), "abc")
            }).rejects.toThrow("User has not registered before");
        });

        test("should register A0 successfully", async function () {
            await rlnA0.register(messageLimitA0, messageIDCounterA0);
            // A0 has not been updated in the registry
            expect(await rlnA0.isRegistered()).toBe(true);
            const allRateCommitments = await rlnA0.getAllRateCommitments();
            expect(allRateCommitments.length).toBe(1);
            expect(allRateCommitments[0]).toBe(await rlnA0.getRateCommitment());
        });

        test("should be able to set message id counter", async function () {
            // Test: set a new message id counter with zero message limit
            // I.e. no message can be sent
            const zeroMessageLimit = BigInt(0)
            const newMessageIDCounter = new FakeMessageIDCounter(zeroMessageLimit)
            await rlnA0.setMessageIDCounter(newMessageIDCounter)
            await expect(async () => {
                await rlnA0.createProof(epoch0, message1)
            }).rejects.toThrow(`Message ID counter exceeded message limit ${zeroMessageLimit}`);
            // Change it back to make other tests work
            await rlnA0.setMessageIDCounter(messageIDCounterA0)
        })

        test("should be able to create proof", async function () {
            const messageIDBefore = await messageIDCounterA0.peekNextMessageID(epoch0);
            proofA00 = await rlnA0.createProof(epoch0, message0);
            const messageIDAfter = await messageIDCounterA0.peekNextMessageID(epoch0);
            expect(messageIDAfter).toBe(messageIDBefore + BigInt(1));
            expect(await rlnA0.verifyProof(epoch0, message0, proofA00)).toBe(true);
        });

        test("should fail to create proof if messageID exceeds limit", async function () {
            const currentMessageID = await messageIDCounterA0.peekNextMessageID(epoch0);
            // Sanity check: messageID should be equal to limit now
            expect(currentMessageID).toBe(messageLimitA0);
            await expect(async () => {
                await rlnA0.createProof(epoch0, message0);
            }).rejects.toThrow("Message ID counter exceeded message limit")
        });

        test("should fail to verify invalid proof", async function () {
            const proofA00Invalid: RLNFullProof = {
                ...proofA00,
                snarkProof: {
                    proof: {
                        ...proofA00.snarkProof.proof,
                        pi_a: [BigInt(1), BigInt(2)],
                    },
                    publicSignals: proofA00.snarkProof.publicSignals,
                }
            }
            expect(await rlnA0.verifyProof(epoch0, message0, proofA00Invalid)).toBeFalsy()
        });

        test("should be able to withdraw", async function () {
            await rlnA0.withdraw();
            await waitUntilFreezePeriodPassed()
            await rlnA0.releaseWithdrawal();
            expect(await rlnA0.isRegistered()).toBe(false);
            expect((await rlnA0.getAllRateCommitments()).length).toBe(1);
        });

        test("should fail to create proof after withdraw", async function () {
            await expect(async () => {
                await rlnA0.createProof(epoch0, message0);
            }).rejects.toThrow("User has not registered before");
        });

        test("should be able to get the latest state with A1", async function () {
            expect(await rlnA1.isRegistered()).toBe(false);
            const allRateCommitmentsA1 = await rlnA1.getAllRateCommitments();
            expect(allRateCommitmentsA1.length).toBe(1);
            expect(allRateCommitmentsA1[0]).toBe((await rlnA0.getAllRateCommitments())[0]);
            expect(await rlnA1.getMerkleRoot()).toBe(await rlnA0.getMerkleRoot());
        });

        test("should be able to register A1", async function () {
            await rlnA1.register(messageLimitA1, messageIDCounterA1);
            expect(await rlnA1.isRegistered()).toBe(true);
            const allRateCommitmentsA1 = await rlnA1.getAllRateCommitments();
            expect(allRateCommitmentsA1.length).toBe(2);
            expect(allRateCommitmentsA1[1]).toBe(await rlnA1.getRateCommitment());
        });

        test("should reveal its secret by itself if A1 creates more than `messageLimitA1` messages", async function () {
            // messageLimitA1 is 1, so A1 can only create 1 proof per epoch
            // Test: can save the first proof
            proofA10 = await rlnA1.createProof(epoch0, message0);
            // Test: status should be DUPLICATE when saving duplicate proof since it has been saved in createProof
            const resA10Again = await rlnA1.saveProof(proofA10);
            expect(resA10Again.status).toBe(Status.DUPLICATE);

            // Reset messageIDCounterA1 at epoch0 to bypass the message id counter and
            // let it create a proof when it already exceeds `messageLimitA1`.
            await rlnA1.setMessageIDCounter(new FakeMessageIDCounter(BigInt(messageLimitA1)));

            // Test: even messageIDCounter is reset, there is another guard `cache`
            // to prevent creating more than `messageLimitA1` proofs
            await expect(async () => {
                await rlnA1.createProof(epoch0, message1);
            }).rejects.toThrow("Proof will spam");

            // Reset cache too, to allow rln createProof
            cacheA1.cache[epoch0.toString()] = {}
            // Reset messageIDCounterA1 again to bypass the message id counter since it increments
            // the message id counter when `createProof` even if it fails.
            await rlnA1.setMessageIDCounter(new FakeMessageIDCounter(BigInt(messageLimitA1)));
            // Test: number of proofs per epoch exceeds `messageLimitA1`, breach/ slashed when `saveProof`
            proofA11 = await rlnA1.createProof(epoch0, message1);
            const resA10AgainAgain = await rlnA1.saveProof(proofA10);
            expect(resA10AgainAgain.status).toBe(Status.BREACH);
            if (resA10AgainAgain.secret === undefined) {
                throw new Error("secret should not be undefined")
            }
            // Test: but A1 cannot slash itself
            const secret = resA10AgainAgain.secret;
            await expect(async () => {
                await rlnA1.slash(secret)
            }).rejects.toThrow('execution reverted: "RLN, slash: self-slashing is prohibited"');

            // Test: epoch1 is a new epoch, so A1 can create 1 proof
            await rlnA1.createProof(epoch1, message1);
        });

        test("should reveal its secret and get slashed by others", async function () {
            // Test: A0 is up-to-date and receives more than `messageLimitA1` proofs,
            // so A1's secret is breached by A0
            const resA10 = await rlnA0.saveProof(proofA10);
            expect(resA10.status).toBe(Status.VALID);
            const resA12 = await rlnA0.saveProof(proofA11);
            expect(resA12.status).toBe(Status.BREACH);
            if (resA12.secret === undefined) {
                throw new Error("secret should not be undefined")
            }
            // Test: A0 should be able to slash A1
            await rlnA0.slash(resA12.secret)
            expect(await rlnA1.isRegistered()).toBe(false);
        });

        test("should be incompatible for RLN if rlnIdentifier is different", async function () {
            // Create another rlnInstance with different rlnIdentifier
            const rlnB = rlnInstanceFactory({
                rlnIdentifier: rlnIdentifierB,
            });
            // Test: verifyProof fails since proofA10.rlnIdentifier mismatches rlnB's rlnIdentifier
            expect(await rlnB.verifyProof(epoch0, message0, proofA10)).toBe(false);
        });
    });
});
