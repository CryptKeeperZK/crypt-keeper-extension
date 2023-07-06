export interface ISignMessageArgs {
  message: string;
  address: string;
}

export interface ICheckMnemonicArgs {
  mnemonic: string;
  strict?: boolean;
}

export interface IChangeMnemonicPassword {
  mnemonic: string;
  password: string;
}
