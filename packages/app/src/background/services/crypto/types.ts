export interface ICryptoServiceArgs {
  password?: string;
  mnemonic?: string;
}

export interface IEncryptArgs {
  secret?: string;
  mode?: ECryptMode;
}

export interface IDecryptArgs {
  secret?: string;
  mode?: ECryptMode;
}

export enum ECryptMode {
  PASSWORD,
  MNEMONIC,
}
