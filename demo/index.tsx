import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { genExternalNullifier, RLN } from '@zk-kit/protocols'
import { bigintToHex } from 'bigint-conversion'
import { ZkIdentity } from '@zk-kit/identity'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const semaphorePath = {
    circuitFilePath: 'http://localhost:8095/semaphore/semaphore.wasm',
    zkeyFilePath: 'http://localhost:8095/semaphore/semaphore_final.zkey'
}

const rlnPath = {
    circuitFilePath: 'http://localhost:8095/rln/rln.wasm',
    zkeyFilePath: 'http://localhost:8095/rln/rln_final.zkey'
}

const merkleStorageAddress = 'http://localhost:8090/merkleProof'

enum MerkleProofType {
    STORAGE_ADDRESS,
    ARTIFACTS
}

const genMockIdentityCommitments = (): string[] => {
    let identityCommitments: string[] = []
    for (let i = 0; i < 10; i++) {
        const mockIdentity = new ZkIdentity()
        let idCommitment = bigintToHex(mockIdentity.genIdentityCommitment())

        identityCommitments.push(idCommitment)
    }
    return identityCommitments
}

function NotConnected() {
    return <div>Please connect to ZK-Keeper to continue.</div>
}

function NoActiveIDCommitment() {
    return <div>Please set an active Identity Commitment in the ZK-Keeper plugin to continue.</div>
}

function App() {
    const [client, setClient] = useState(null)
    const [isLocked, setIsLocked] = useState(true)
    const [identityCommitment, setIdentityCommitment] = useState('')
    const mockIdentityCommitments: string[] = genMockIdentityCommitments()

    const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'

        let storageAddressOrArtifacts: any = `${merkleStorageAddress}/Semaphore`
        if (proofType === MerkleProofType.ARTIFACTS) {
            if (!mockIdentityCommitments.includes(identityCommitment)) {
                mockIdentityCommitments.push(identityCommitment)
            }
            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitments,
                depth: 20,
                leavesPerNode: 2
            }
        }

        let toastId
        try {
            toastId = toast('Generating semaphore proof...', {
                type: 'info',
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false
            })

            const proof = await client.semaphoreProof(
                externalNullifier,
                signal,
                semaphorePath.circuitFilePath,
                semaphorePath.zkeyFilePath,
                storageAddressOrArtifacts
            )

            toast('Semaphore proof generated successfully!', { type: 'success' })
        } catch (e) {
            toast('Error while generating Semaphore proof!', { type: 'error' })
            console.error(e)
        }

        toast.dismiss(toastId)
    }

    const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
        const externalNullifier = genExternalNullifier('voting-1')
        const signal = '0x111'
        const rlnIdentifier = RLN.genIdentifier()
        const rlnIdentifierHex = bigintToHex(rlnIdentifier)

        let storageAddressOrArtifacts: any = `${merkleStorageAddress}/RLN`

        if (proofType === MerkleProofType.ARTIFACTS) {
            if (!mockIdentityCommitments.includes(identityCommitment)) {
                mockIdentityCommitments.push(identityCommitment)
            }

            storageAddressOrArtifacts = {
                leaves: mockIdentityCommitments,
                depth: 15,
                leavesPerNode: 2
            }
        }

        let circuitPath = rlnPath.circuitFilePath
        let zkeyFilePath = rlnPath.zkeyFilePath

        let toastId
        try {
            toastId = toast('Generating RLN proof...', {
                type: 'info',
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false
            })

            const proof = await client.rlnProof(
                externalNullifier,
                signal,
                circuitPath,
                zkeyFilePath,
                storageAddressOrArtifacts,
                rlnIdentifierHex
            )

            toast('RLN proof generated successfully!', { type: 'success' })
        } catch (e) {
            toast('Error while generating RLN proof!', { type: 'error' })
            console.error(e)
        }
        toast.dismiss(toastId)
    }

    const getIdentityCommitment = async () => {
        const idCommitment = await client.getActiveIdentity()
        setIdentityCommitment(idCommitment)
    }

    useEffect(() => {
        ;(async function IIFE() {
            initClient()

            if (client) {
                await getIdentityCommitment()
                await client.on('identityChanged', (idCommitment) => {
                    setIdentityCommitment(idCommitment)
                })

                await client.on('logout', async () => {
                    setIdentityCommitment('')
                    setIsLocked(true)
                })

                await client.on('login', async () => {
                    setIsLocked(false)
                    await getIdentityCommitment()
                })
            }
        })()
    }, [client])

    const initClient = async () => {
        const { zkpr } = window as any
        const client = await zkpr.connect()
        setClient(client)
        setIsLocked(false)
    }

    return (
        <div>
            {!client || isLocked ? (
                <NotConnected />
            ) : identityCommitment === '' || identityCommitment === null ? (
                <NoActiveIDCommitment />
            ) : (
                <div>
                    <div>
                        <h2>Semaphore</h2>
                        <button onClick={() => genSemaphoreProof(MerkleProofType.STORAGE_ADDRESS)}>
                            Generate proof from Merkle proof storage address
                        </button>{' '}
                        <br />
                        <br />
                        <button onClick={() => genSemaphoreProof(MerkleProofType.ARTIFACTS)}>
                            Generate proof from Merkle proof artifacts
                        </button>
                    </div>
                    <hr />
                    <div>
                        <h2>RLN</h2>
                        <button onClick={() => genRLNProof(MerkleProofType.STORAGE_ADDRESS)}>
                            Generate proof from Merkle proof storage address
                        </button>{' '}
                        <br />
                        <br />
                        <button onClick={() => genRLNProof(MerkleProofType.ARTIFACTS)}>
                            Generate proof from Merkle proof artifacts
                        </button>
                    </div>

                    <hr />
                    <div>
                        <h2>Get identity commitment</h2>
                        <button onClick={() => getIdentityCommitment()}>Get</button> <br />
                        <br />
                    </div>

                    <hr />
                    <div>
                        <h2>Identity commitment for active identity:</h2>
                        <p>{identityCommitment}</p>
                    </div>

                    <ToastContainer newestOnTop={true} />
                </div>
            )}
        </div>
    )
}

const root = document.getElementById('root')

ReactDOM.render(<App />, root)
