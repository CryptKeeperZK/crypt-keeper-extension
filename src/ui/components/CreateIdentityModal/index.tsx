import React, { ReactElement, useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { createIdentity } from '@src/ui/ducks/identities'
import FullModal, { FullModalContent, FullModalFooter, FullModalHeader } from '@src/ui/components/FullModal'
import Dropdown from '@src/ui/components/Dropdown'
import Input from '@src/ui/components/Input'
import Button from '@src/ui/components/Button'

export default function CreateIdentityModal(props: { onClose: () => void }): ReactElement {
    const [nonce, setNonce] = useState(0)
    const [identityType, setIdentityType] = useState<'InterRep' | 'Random'>('InterRep')
    const [web2Provider, setWeb2Provider] = useState<'Twitter' | 'Github' | 'Reddit'>('Twitter')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const create = useCallback(async () => {
        setLoading(true)
        try {
            let options: any = {
                nonce,
                web2Provider
            }
            let provider = 'interrep'

            if (identityType === 'Random') {
                provider = 'random'
                options = {}
            }

            await dispatch(createIdentity(provider, options))
            props.onClose()
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [nonce, web2Provider, identityType])

    return (
        <FullModal onClose={props.onClose}>
            <FullModalHeader onClose={props.onClose}>Create Identity</FullModalHeader>
            <FullModalContent>
                <Dropdown
                    className="my-2"
                    label="Identity type"
                    options={[{ value: 'InterRep' }, { value: 'Random' }]}
                    onChange={(e) => {
                        setIdentityType(e.target.value as any)
                    }}
                    value={identityType}
                />
                {identityType === 'InterRep' && (
                    <>
                        <Dropdown
                            className="my-2"
                            label="Web2 Provider"
                            options={[{ value: 'Twitter' }, { value: 'Reddit' }, { value: 'Github' }]}
                            onChange={(e) => {
                                setWeb2Provider(e.target.value as any)
                            }}
                            value={web2Provider}
                        />
                        <Input
                            className="my-2"
                            type="number"
                            label="Nonce"
                            step={1}
                            defaultValue={nonce}
                            onChange={(e) => setNonce(Number(e.target.value))}
                        />
                    </>
                )}
            </FullModalContent>
            {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}
            <FullModalFooter>
                <Button onClick={create} loading={loading}>
                    Create
                </Button>
            </FullModalFooter>
        </FullModal>
    )
}
