import React, { ReactElement, useCallback } from 'react'
import Icon from '@src/ui/components/Icon'
import LogoSVG from '@src/static/icons/logo.svg'
import LoaderSVG from '@src/static/icons/loader.svg'
import { setAccount, setBalance, setChainId, setNetwork, setWeb3Connecting, useAccount, useNetwork, useWeb3Connecting } from '@src/ui/ducks/web3'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import './header.scss'
import classNames from 'classnames'
import Menuable from '@src/ui/components/Menuable'
import { MetaMaskProviderService } from '@src/web3-providers/Metamask'
import { useAppDispatch } from '@src/ui/ducks/hooks'

export default function Header(): ReactElement {
    const dispatch = useAppDispatch()
    const network = useNetwork()
    const account = useAccount()
    const web3Connecting = useWeb3Connecting()

    const connectMetamask = useCallback(async () => {
        dispatch(setWeb3Connecting(true));
        console.log("Inside connectMetamask button");

        const metamaskProviderService = new MetaMaskProviderService();
        const metamaskProvider = metamaskProviderService.getMetamaskProvider;
        const ethersProivder = metamaskProviderService.getEthersProvider;

        // Connect to MetaMask
        const walletInfo = await metamaskProviderService.connectMetaMask();

        dispatch(setAccount(walletInfo.account));
        dispatch(setBalance(walletInfo.balance));
        dispatch(setNetwork(walletInfo.networkName));
        dispatch(setChainId(walletInfo.chainId));

        // TODO: better to move them to the MetaMaskProviderService
        metamaskProvider.on("accountsChanged", async (account: any) => {
            console.log("Inside MetaMaskProvider accountsChanged: ", account);
            const balance = await ethersProivder.getAccountBalance(account[0]);
            dispatch(setAccount(account[0]));
            dispatch(setBalance(balance));
          });
      
        metamaskProvider.on("chainChanged", async () => {
            console.log("Inside MetaMaskProvider chainChanged");
        
            const networkDetails = await ethersProivder.getNetworkDetails();
            const networkName = networkDetails.name;
            const chainId = networkDetails.chainId;
        
            if (networkName) dispatch(setNetwork(networkName));
            if (chainId) dispatch(setChainId(chainId));
        });
    
        metamaskProvider.on("error", (e: any) => {
            console.log("Inside MetaMaskProvider  error: ", e);
            throw e;
        });
    
        metamaskProvider.on("connect", () => {
            console.log("Inside MetaMaskProvider  connect");
        });
    
        metamaskProvider.on("disconnect", () => {
            console.log("Inside MetaMaskProvider  disconnect");
        });

        setWeb3Connecting(false)
    }, [account, network, web3Connecting]);

    const lock = useCallback(async () => {
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
                                    label: 'Lock',
                                    onClick: lock
                                }
                            ]}
                        >
                            <Jazzicon diameter={32} seed={jsNumberForAddress(account)} />
                        </Menuable>
                    ) : (
                        <div title="Connect to Metamask" onClick={connectMetamask}>
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
