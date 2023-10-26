import { useEthWallet } from "./useEthWallet";

export interface IUseSignatureOptionsArgs {
  isLoading: boolean;
}

export interface IUseSignatureOptionsData {
  options: ISignatureOption[];
}

export interface ISignatureOption {
  id: string;
  title: string;
  checkDisabledItem: () => boolean;
}

export const useSignatureOptions = ({ isLoading }: IUseSignatureOptionsArgs): IUseSignatureOptionsData => {
  const ethWallet = useEthWallet();

  const { isActive: isWalletConnected, isInjectedWallet: isWalletInstalled } = ethWallet;
  const ethWalletTitle = isWalletConnected ? "Sign with MetaMask" : "Connect to MetaMask";

  const options = [
    { id: "ck", title: "Sign with CryptKeeper", checkDisabledItem: () => isLoading },
    {
      id: "eth",
      title: isWalletInstalled ? ethWalletTitle : "Install MetaMask",
      checkDisabledItem: () => isLoading || !isWalletInstalled,
    },
  ];

  return { options };
};
