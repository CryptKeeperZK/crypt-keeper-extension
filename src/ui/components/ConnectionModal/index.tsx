import FullModal, { FullModalContent, FullModalFooter, FullModalHeader } from '@src/ui/components/FullModal'
import React, { useCallback, useEffect, useState } from 'react'
import { browser } from 'webextension-polyfill-ts'
import Button, { ButtonType } from '@src/ui/components/Button'
import Icon from '@src/ui/components/Icon'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import Checkbox from '@src/ui/components/Checkbox'
import { getLinkPreview } from 'link-preview-js'

export default function ConnectionModal(props: { onClose: () => void; refreshConnectionStatus: () => void }) {
    const { onClose, refreshConnectionStatus } = props

    const [checked, setChecked] = useState(false)
    const [url, setUrl] = useState<URL>()
    const [faviconUrl, setFaviconUrl] = useState('')

    useEffect(() => {
        ;(async function onConnectionModalMount() {
            try {
                const tabs = await browser.tabs.query({
                    active: true,
                    lastFocusedWindow: true
                })

                const [tab] = tabs || []

                if (tab?.url) {
                    setUrl(new URL(tab.url))
                }
            } catch (e) {}
        })()
    }, [])

    useEffect(() => {
        ;(async () => {
            if (url?.origin) {
                const res = await postMessage({
                    method: RPCAction.GET_HOST_PERMISSIONS,
                    payload: url?.origin
                })
                setChecked(res?.noApproval)
            }
        })()
    }, [url])

    useEffect(() => {
        ;(async () => {
            if (url?.origin) {
                const data = await getLinkPreview(url?.origin)
                const [favicon] = data?.favicons || []
                setFaviconUrl(favicon)
            }
        })()
    }, [url])

    const onRemoveHost = useCallback(async () => {
        await postMessage({
            method: RPCAction.REMOVE_HOST,
            payload: {
                host: url?.origin
            }
        })
        await refreshConnectionStatus()
        props.onClose()
    }, [url?.origin])

    const setApproval = useCallback(
        async (noApproval: boolean) => {
            const res = await postMessage({
                method: RPCAction.SET_HOST_PERMISSIONS,
                payload: {
                    host: url?.origin,
                    noApproval
                }
            })
            setChecked(res?.noApproval)
        },
        [url?.origin]
    )

    return (
        <FullModal onClose={onClose}>
            <FullModalHeader onClose={onClose}>
                {url?.protocol === 'chrome-extension:' ? 'Chrome Extension Page' : url?.host}
            </FullModalHeader>
            <FullModalContent className="flex flex-col items-center">
                {url?.protocol === 'chrome-extension:' ? (
                    <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0 flex flex-row items-center justify-center">
                        <Icon fontAwesome="fas fa-tools" size={1.5} className="text-gray-700" />
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0 flex flex-row items-center justify-center">
                        <div
                            className="w-16 h-16"
                            style={{
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundImage: `url(${faviconUrl})`
                            }}
                        />
                    </div>
                )}
                <div className="font-bold">Permissions</div>
                <div className="flex flex-row items-start">
                    <Checkbox
                        className="mr-2 mt-2 flex-shrink-0"
                        checked={checked}
                        onChange={(e) => {
                            setApproval(e.target.checked)
                        }}
                    />
                    <div className="text-sm mt-2">Allow host to create proof without approvals</div>
                </div>
            </FullModalContent>
            <FullModalFooter className="justify-center">
                <Button className="ml-2" btnType={ButtonType.secondary} onClick={onRemoveHost}>
                    Disconnect
                </Button>
                <Button className="ml-2" onClick={props.onClose}>
                    Close
                </Button>
            </FullModalFooter>
        </FullModal>
    )
}
