import { AES, enc, HmacSHA256, SHA256 } from "crypto-js";

import { validateMnemonic } from "@src/background/services/mnemonic";

interface ICryptoServiceArgs {
  password?: string;
  mnemonic?: string;
}

export default class CryptoService {
  private static INSTANCE: CryptoService;

  private password?: string;

  private mnemonic?: string;

  private constructor({ password, mnemonic }: ICryptoServiceArgs) {
    this.password = password;
    this.mnemonic = mnemonic;
  }

  static getInstance(args: ICryptoServiceArgs = {}): CryptoService {
    if (!CryptoService.INSTANCE) {
      CryptoService.INSTANCE = new CryptoService(args);
    }

    return CryptoService.INSTANCE;
  }

  setPassword(password: string): CryptoService {
    this.password = password;

    return this;
  }

  setMnemonic(mnemonic: string): CryptoService {
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Mnemonic is invalid");
    }

    this.mnemonic = mnemonic;

    return this;
  }

  clear(): void {
    this.password = undefined;
    this.mnemonic = undefined;
  }

  isAuthenticPassword(password: string): boolean {
    if (this.password !== password) {
      throw new Error("Password doesn't match with current");
    }

    return true;
  }

  encrypt(text: string, password = this.password): string {
    this.checkPasswordInitialized(password);

    return AES.encrypt(text, password as string).toString();
  }

  decrypt(ciphertext: string, password = this.password): string {
    this.checkPasswordInitialized(password);

    const bytes = AES.decrypt(ciphertext, password as string);
    return bytes.toString(enc.Utf8);
  }

  generateEncryptedHmac(ciphertext: string, password: string): string {
    this.checkPasswordInitialized(password);
    this.isAuthenticPassword(password);

    const hmac = this.generateHmac(ciphertext, password);
    return `${hmac}${ciphertext}`;
  }

  getAuthenticCiphertext(ciphertext: string, password: string): string {
    this.checkPasswordInitialized(password);
    this.isAuthenticPassword(password);

    const transitHmac = ciphertext.substring(0, 64);
    const transitCipherContent = ciphertext.substring(64);
    const decryptedHmac = this.generateHmac(transitCipherContent, password);
    const isAuthentic = transitHmac === decryptedHmac;

    if (!isAuthentic) {
      throw new Error("This ciphertext is not authentic");
    }

    return transitCipherContent;
  }

  private generateHmac(ciphertext: string, password: string): string {
    return HmacSHA256(ciphertext, SHA256(password)).toString();
  }

  private checkPasswordInitialized(password = this.password): void {
    if (!password) {
      throw new Error("Password is not provided");
    }
  }
}
