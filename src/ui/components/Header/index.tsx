import React, { ReactElement, useCallback } from 'react'
import Icon from '@src/ui/components/Icon'
import LogoSVG from '@src/static/icons/logo.svg'
import LoaderSVG from '@src/static/icons/loader.svg'
import { useAccount, useNetwork, useWeb3Connecting } from '@src/ui/ducks/web3'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import './header.scss'
import classNames from 'classnames'
import Menuable from '@src/ui/components/Menuable'

export default function Header(): ReactElement {
    const network = useNetwork()
    const account = useAccount()
    const web3Connecting = useWeb3Connecting()

    const connectMetamask = useCallback(async () => {
        await postMessage({ method: RPCAction.CONNECT_METAMASK })
    }, [])

    const disconnect = useCallback(async () => {
        await postMessage({ method: RPCAction.LOCK })
    }, [])

    return (
        <div className="header h-16 flex flex-row items-center px-4">
            <Icon url={LogoSVG} size={3} />
            <div className="flex-grow flex flex-row items-center justify-end header__content">
                {network && <div className="text-sm rounded-full header__network-type">{network?.name}</div>}
                <div className="header__account-icon">
                    {account ? (
                        <Menuable
                            className="flex user-menu"
                            items={[
                                {
                                    label: 'Logout',
                                    onClick: disconnect
                                }
                            ]}
                        >
                            <Jazzicon diameter={32} seed={jsNumberForAddress(account)} />
                        </Menuable>
                    ) : (
                        <div onClick={connectMetamask}>
                            <Icon
                                fontAwesome={classNames({
                                    'fas fa-plug': !web3Connecting
                                })}
                                url={web3Connecting ? LoaderSVG : undefined}
                                size={1.25}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
