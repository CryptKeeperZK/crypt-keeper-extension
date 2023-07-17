import { ethers } from "ethers";

import { spawn } from "child_process";
import { rlnContractABI, RLNContract } from "../src/contract-wrapper";

import { rlnContractBytecode, testERC20ContractBytecode, mockVerifierBytecode } from "./configs";

const testERC20ABI = '[{"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "stateMutability": "nonpayable", "type": "constructor"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "spender", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Approval", "type": "event"}, {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"}, {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}], "name": "allowance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "decimals", "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "subtractedValue", "type": "uint256"}], "name": "decreaseAllowance", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "addedValue", "type": "uint256"}], "name": "increaseAllowance", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"}, {"inputs": [], "name": "totalSupply", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "transfer", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "transferFrom", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}]'
const mockVerifierABI = '[{"inputs": [], "stateMutability": "nonpayable", "type": "constructor"}, {"inputs": [{"internalType": "bool", "name": "_result", "type": "bool"}], "name": "changeResult", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {"inputs": [], "name": "result", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"}, {"inputs": [{"internalType": "uint256[2]", "name": "", "type": "uint256[2]"}, {"internalType": "uint256[2][2]", "name": "", "type": "uint256[2][2]"}, {"internalType": "uint256[2]", "name": "", "type": "uint256[2]"}, {"internalType": "uint256[2]", "name": "", "type": "uint256[2]"}], "name": "verifyProof", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"}]'
const timeout = 100000

async function deployContract(signer: ethers.Signer, bytecode: string, abi: string, args?: any[]) {
    const factory = new ethers.ContractFactory(abi, bytecode, signer)
    if (!args) {
        args = []
    }
    const contract = await factory.deploy(...args)
    await contract.waitForDeployment()
    const address = await contract.getAddress()
    return new ethers.Contract(address, abi, signer)
}

export async function setupTestingContracts(args: {
    initialTokenAmount: bigint,
    minimalDeposit: bigint,
    treeDepth: number,
    feePercentage: bigint,
    feeReceiver: string,
    freezePeriod: bigint,
}) {
    // Let os choose port for us to avoid conflicts
    const node = spawn("npx", ["hardhat", "node", "--port", "0"])
    const pid = node.pid
    if (!pid) {
        throw new Error("process failed to start")
    }
    // This line is printed when the node is ready
    const endString = "Any funds sent to them on Mainnet or any other live network WILL BE LOST."
    let url: string | undefined = undefined;
    await new Promise((resolve, reject) => {
        const t = setTimeout(() => {
            reject(new Error("Timeout when waiting for hardhat node to start"))
        }, timeout)
        const f = (data) => {
            const dataString = data.toString()
            // Get url printed from the node
            const ipAddressMatch = dataString.match(/Started HTTP and WebSocket JSON-RPC server at (http:\/\/127\.0\.0\.1:\d+)/)
            if (ipAddressMatch !== null) {
                url = ipAddressMatch[1]
                return;
            }
            // If we see this line, we know the node is ready and we can return
            if (dataString.indexOf(endString) !== -1) {
                clearTimeout(t)
                resolve(undefined)
                node.stdout.removeListener("data", f)
            }
        }
        node.stdout.on("data", f);
    })

    if (url === undefined) {
        throw new Error("Failed to get url from hardhat node")
    }

    const provider = new ethers.JsonRpcProvider(url)
    const signer0 = await provider.getSigner(0)
    const signer1 = await provider.getSigner(1)

    const mockVerifierContract = await deployContract(signer0, mockVerifierBytecode, mockVerifierABI)
    const erc20Contract = await deployContract(signer0, testERC20ContractBytecode, testERC20ABI, [args.initialTokenAmount])
    // Gives signer1 some tokens to test
    await erc20Contract.transfer(await signer1.getAddress(), args.initialTokenAmount / BigInt(2));
    const contractAtBlock = await provider.getBlockNumber()
    const rlnContractArgs = [
        args.minimalDeposit,
        args.treeDepth,
        args.feePercentage,
        args.feeReceiver,
        args.freezePeriod,
        await erc20Contract.getAddress(),
        await mockVerifierContract.getAddress(),
    ]
    const rlnContract = await deployContract(signer0, rlnContractBytecode, rlnContractABI, rlnContractArgs)
    const rlnContractWrapper = new RLNContract({
        provider,
        signer: signer0,
        contractAddress: await rlnContract.getAddress(),
        contractAtBlock,
    })

    async function waitUntilFreezePeriodPassed() {
        const numBlocks = Number(args.freezePeriod) + 1
        const blockNumberBefore = await provider.getBlockNumber()
        for (let i = 0; i < numBlocks; i++) {
            const tx = await mockVerifierContract.changeResult(true)
            await tx.wait()
        }
        const blockNumberAfter = await provider.getBlockNumber()
        if (blockNumberAfter - blockNumberBefore !== numBlocks) {
            throw new Error(`Expected to mine ${numBlocks} blocks, but mined ${blockNumberAfter - blockNumberBefore} blocks`)
        }
    }

    // Kill node
    async function killNode() {
        await new Promise((resolve, reject) => {
            // Only wait for timeout seconds
            const t = setTimeout(() => {
                reject(new Error('Killing node process timeout'));
            }, timeout);
            // Returns when node is killed
            node.on('exit', (code, signal) => {
                console.log(
                    `RPC node exited with code = ${code}, signal = ${signal}`
                );
                clearTimeout(t);
                resolve(undefined)
            });
            // FIXME: Still not able to solve "A worker process has failed to exit
            // gracefully and has been force exited. This is likely caused by tests leaking due to
            // improper teardown. Try running with --detectOpenHandles to find leaks.
            // Active timers can also cause this, ensure that .unref() was called on them."
            // NOTE: No errors are shown when `detectOpenHandles: true` is set in jest.config.ts
            node.stdin.destroy();
            node.kill();
            node.unref();
        })
    }

    return {
        node,
        provider,
        signer0,
        signer1,
        mockVerifierContract,
        erc20Contract,
        rlnContract,
        rlnContractWrapper,
        contractAtBlock,
        waitUntilFreezePeriodPassed,
        killNode,
    }
}
