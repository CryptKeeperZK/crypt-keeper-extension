import { ethers } from "ethers";

import { ChildProcessWithoutNullStreams } from "child_process";
import { RLNContract } from "../src/contract-wrapper";

import { DEFAULT_MERKLE_TREE_DEPTH } from "../src/common";
import { fieldFactory } from "./utils";
import { Proof } from "../src";
import { setupTestingContracts } from "./factories";


describe("RLNContract", () => {
    let node: ChildProcessWithoutNullStreams
    let provider: ethers.JsonRpcProvider
    let signer: ethers.Signer
    let rlnContract: ethers.Contract
    let erc20Contract: ethers.Contract
    let mockVerifierContract: ethers.Contract
    let rlnContractWrapper: RLNContract
    let waitUntilFreezePeriodPassed: () => Promise<void>
    let killNode: () => Promise<void>

    let signerAnother: ethers.Signer
    let rlnContractWrapperAnother: RLNContract

    const tokenAmount = BigInt("1000000000000000000")
    // 10 token
    const minimalDeposit = BigInt(10)
    const treeDepth = DEFAULT_MERKLE_TREE_DEPTH
    // 10%
    const feePercentage = BigInt(10)
    const feeReceiver = "0x0000000000000000000000000000000000005566"
    const freezePeriod = BigInt(1)
    const expectedMessageLimit = BigInt(2)
    const expectedDepositAmount = expectedMessageLimit * minimalDeposit

    const mockProof: Proof = {
        pi_a: [fieldFactory(), fieldFactory()],
        pi_b: [
            [
                fieldFactory(),
                fieldFactory(),
            ],
            [
                fieldFactory(),
                fieldFactory(),
            ],
        ],
        pi_c: [fieldFactory(), fieldFactory()],
        protocol: "groth",
        curve: "bn128",
    }

    const identityCommitment = fieldFactory()
    const identityCommitmentAnother = fieldFactory()


    beforeAll(async () => {
        const deployed = await setupTestingContracts({
            initialTokenAmount: tokenAmount,
            minimalDeposit,
            treeDepth,
            feePercentage,
            feeReceiver,
            freezePeriod,
        });
        node = deployed.node
        provider = deployed.provider
        signer = deployed.signer0
        mockVerifierContract = deployed.mockVerifierContract
        erc20Contract = deployed.erc20Contract
        rlnContract = deployed.rlnContract
        rlnContractWrapper = deployed.rlnContractWrapper
        waitUntilFreezePeriodPassed = deployed.waitUntilFreezePeriodPassed
        killNode = deployed.killNode
        signerAnother = deployed.signer1
        rlnContractWrapperAnother = new RLNContract({
            provider,
            signer: signerAnother,
            contractAddress: await rlnContract.getAddress(),
            contractAtBlock: deployed.contractAtBlock,
        })
    });

    afterAll(async () => {
        console.log("killing node")
        await killNode()
        console.log("node killed")
    });

    test("should be enough tokens in signer account", async () => {
        expect(await erc20Contract.balanceOf(await signer.getAddress())).toBeGreaterThanOrEqual(expectedDepositAmount)
    });

    // RLNContract
    test("should register", async () => {
        const balanceBefore = await erc20Contract.balanceOf(await signer.getAddress())
        await rlnContractWrapper.register(identityCommitment, expectedMessageLimit)
        const balanceAfter = await erc20Contract.balanceOf(await signer.getAddress())
        const user = await rlnContractWrapper.getUser(identityCommitment)
        expect(user.userAddress).toBe(await signer.getAddress())
        expect(user.messageLimit).toBe(expectedMessageLimit)
        expect(user.index).toBe(BigInt(0))
        expect(balanceBefore - balanceAfter).toBe(expectedDepositAmount)
    });

    test("should withdraw and release", async () => {
        // Test: after calling withdraw, user should not receive tokens until calling release
        const balanceBefore = await erc20Contract.balanceOf(await signer.getAddress())
        await rlnContractWrapper.withdraw(identityCommitment, mockProof)
        const balanceAfter = await erc20Contract.balanceOf(await signer.getAddress())
        expect(balanceAfter - balanceBefore).toBe(BigInt(0))

        // Release
        await expect(async () => {
            await rlnContractWrapper.release(identityCommitment)
        }).rejects.toThrow('RLN, release: cannot release yet')

        await waitUntilFreezePeriodPassed()

        // Test: should receive tokens after release
        const balanceBeforeRelease = await erc20Contract.balanceOf(await signer.getAddress())
        await rlnContractWrapper.release(identityCommitment)
        const balanceAfterRelease = await erc20Contract.balanceOf(await signer.getAddress())
        expect(balanceAfterRelease - balanceBeforeRelease).toBe(expectedDepositAmount)
    });

    test("should register another and slash with proof", async () => {
        // Test: should register
        await rlnContractWrapperAnother.register(identityCommitmentAnother, expectedMessageLimit)
        const user = await rlnContractWrapperAnother.getUser(identityCommitmentAnother)
        expect(user.userAddress).toBe(await signerAnother.getAddress())
        expect(user.messageLimit).toBe(expectedMessageLimit)
        expect(user.index).toBe(BigInt(1))

        // Test: should be slashed since verifier always consider proof valid
        const slashReceiver = "0x0000000000000000000000000000000000001234"
        const expectedFee = expectedDepositAmount * feePercentage / BigInt(100)
        const expectedReceivedAmount = expectedDepositAmount - expectedFee
        const balanceBefore = await erc20Contract.balanceOf(slashReceiver)
        await rlnContractWrapper.slash(identityCommitmentAnother, slashReceiver, mockProof)
        const balanceAfter = await erc20Contract.balanceOf(slashReceiver)
        expect(balanceAfter - balanceBefore).toBe(expectedReceivedAmount)
    });

    test("should get logs", async () => {
        const logs = await rlnContractWrapper.getLogs()
        expect(logs.length).toBe(4)
        expect(logs[0].name).toBe("MemberRegistered")
        expect(logs[1].name).toBe("MemberWithdrawn")
        expect(logs[2].name).toBe("MemberRegistered")
        expect(logs[3].name).toBe("MemberSlashed")
    })

});
