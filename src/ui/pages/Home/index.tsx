import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import { fetchWalletInfo, useNetwork } from '@src/ui/ducks/web3'
import Icon from '@src/ui/components/Icon'
import {
    fetchIdentities,
    setActiveIdentity,
    useIdentities,
    useSelectedIdentity
} from '@src/ui/ducks/identities'
import Header from '@src/ui/components/Header'
import classNames from 'classnames'
import { browser } from 'webextension-polyfill-ts'
import './home.scss'
import {ellipsify}  from '@src/util/account'
import CreateIdentityModal from '@src/ui/components/CreateIdentityModal'
import ConnectionModal from '@src/ui/components/ConnectionModal'

export default function Home(): ReactElement {
    const dispatch = useDispatch()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [fixedTabs, fixTabs] = useState(false)

    useEffect(() => {
        dispatch(fetchIdentities())
        dispatch(fetchWalletInfo())
    }, [])

    const onScroll = useCallback(async () => {
        if (!scrollRef.current) return

        const scrollTop = scrollRef.current?.scrollTop

        fixTabs(scrollTop > 92)
    }, [scrollRef])

    return (
        <div className="w-full h-full flex flex-col home">
            <Header />
            <div
                ref={scrollRef}
                className={classNames('flex flex-col flex-grow flex-shrink overflow-y-auto home__scroller', {
                    'home__scroller--fixed-menu': fixedTabs
                })}
                onScroll={onScroll}
            >
                <HomeInfo />
                <HomeList />
            </div>
        </div>
    )
}

var HomeInfo = function(): ReactElement {
    const network = useNetwork()
    const [connected, setConnected] = useState(false)
    const [showingModal, showModal] = useState(false)

    useEffect(() => {
        ;(async () => {
            await refreshConnectionStatus()
        })()
    }, [])

    const refreshConnectionStatus = useCallback(async () => {
        try {
            const tabs = await browser.tabs.query({ active: true, lastFocusedWindow: true })
            const [tab] = tabs || []

            if (tab?.url) {
                const { origin } = new URL(tab.url)
                const isHostApproved = await postMessage({
                    method: RPCAction.IS_HOST_APPROVED,
                    payload: origin
                })

                setConnected(isHostApproved)
            }
        } catch (e) {
            setConnected(false)
        }
    }, [])

    return (
        <>
            {showingModal && (
                <ConnectionModal onClose={() => showModal(false)} refreshConnectionStatus={refreshConnectionStatus} />
            )}
            <div className="home__info">
                <div
                    className={classNames('home__connection-button', {
                        'home__connection-button--connected': connected
                    })}
                    onClick={connected ? () => showModal(true) : undefined}
                >
                    <div
                        className={classNames('home__connection-button__icon', {
                            'home__connection-button__icon--connected': connected
                        })}
                    />
                    <div className="text-xs home__connection-button__text">
                        {connected ? 'Connected' : 'Not Connected'}
                    </div>
                </div>
                <div>
                    <div className="text-3xl font-semibold">
                        {network ? `0.0000 ${network.nativeCurrency.symbol}` : '-'}
                    </div>
                </div>
            </div>
        </>
    )
}

var HomeList = function(): ReactElement {
    const [selectedTab, selectTab] = useState<'identities' | 'activity'>('identities')

    return (
        <div className="home__list">
            <div className="home__list__header">
                <div
                    className={classNames('home__list__header__tab', {
                        'home__list__header__tab--selected': selectedTab === 'identities'
                    })}
                    onClick={() => selectTab('identities')}
                >
                    Identities
                </div>
                <div
                    className={classNames('home__list__header__tab', {
                        'home__list__header__tab--selected': selectedTab === 'activity'
                    })}
                    onClick={() => selectTab('activity')}
                >
                    Activity
                </div>
            </div>
            <div className="home__list__fix-header">
                <div
                    className={classNames('home__list__header__tab', {
                        'home__list__header__tab--selected': selectedTab === 'identities'
                    })}
                    onClick={() => selectTab('identities')}
                >
                    Identities
                </div>
                <div
                    className={classNames('home__list__header__tab', {
                        'home__list__header__tab--selected': selectedTab === 'activity'
                    })}
                    onClick={() => selectTab('activity')}
                >
                    Activity
                </div>
            </div>
            <div className="home__list__content">
                {selectedTab === 'identities' ? <IdentityList /> : null}
                {selectedTab === 'activity' ? <ActivityList /> : null}
            </div>
        </div>
    )
}

var IdentityList = function(): ReactElement {
    const identities = useIdentities()
    const selected = useSelectedIdentity()
    const dispatch = useDispatch()
    const selectIdentity = useCallback(async (identityCommitment: string) => {
        dispatch(setActiveIdentity(identityCommitment))
    }, [])
    const [showingModal, showModal] = useState(false)

    useEffect(() => {
        dispatch(fetchIdentities())
    }, [])

    return (
        <>
            {showingModal && <CreateIdentityModal onClose={() => showModal(false)} />}
            {identities.map(({ commitment, metadata }, i) => (
                <div className="p-4 identity-row" key={commitment}>
                    <Icon
                        className={classNames('identity-row__select-icon', {
                            'identity-row__select-icon--selected': selected.commitment === commitment
                        })}
                        fontAwesome="fas fa-check"
                        onClick={() => selectIdentity(commitment)}
                    />
                    <div className="flex flex-col flex-grow">
                        <div className="flex flex-row items-center text-lg font-semibold">
                            {`${metadata.name}`}
                            <span className="text-xs py-1 px-2 ml-2 rounded-full bg-gray-500 text-gray-800">
                                {metadata.provider}
                            </span>
                        </div>
                        <div className="text-base text-gray-500">{ellipsify(commitment)}</div>
                    </div>
                    <Icon className="identity-row__menu-icon" fontAwesome="fas fa-ellipsis-h" />
                </div>
            ))}
            <div
                className="create-identity-row flex flex-row items-center justify-center p-4 cursor-pointer text-gray-600"
                onClick={() => showModal(true)}
            >
                <Icon fontAwesome="fas fa-plus" size={1} className="mr-2" />
                <div>Add Identity</div>
            </div>
        </>
    )
}

var ActivityList = function(): ReactElement {
    return <div />
}
