import { AES, enc, HmacSHA256, SHA256 } from "crypto-js";

export default class CryptoService {
  private secret?: string;

  constructor(secret?: string) {
    this.secret = secret;
  }

  setSecret(secret: string): void {
    this.secret = secret;
  }

  encrypt(text: string, secret = this.secret): string {
    this.checkSecretInitialized(secret);

    return AES.encrypt(text, secret as string).toString();
  }

  decrypt(ciphertext: string, secret = this.secret): string {
    this.checkSecretInitialized(secret);

    const bytes = AES.decrypt(ciphertext, secret as string);
    return bytes.toString(enc.Utf8);
  }

  generateEncryptedHmac(ciphertext: string, secret = this.secret): string {
    this.checkSecretInitialized(secret);

    const hmac = this.generateHmac(ciphertext, secret as string);
    return `${hmac}${ciphertext}`;
  }

  getAuthenticCiphertext(ciphertext: string, secret = this.secret): string {
    this.checkSecretInitialized(secret);

    const transitHmac = ciphertext.substring(0, 64);
    const transitCipherContent = ciphertext.substring(64);
    const decryptedHmac = this.generateHmac(transitCipherContent, secret as string);
    const isAuthentic = transitHmac === decryptedHmac;

    if (!isAuthentic) {
      throw new Error("This ciphertext is not authentic");
    }

    return transitCipherContent;
  }

  private generateHmac(ciphertext: string, password: string): string {
    return HmacSHA256(ciphertext, SHA256(password)).toString();
  }

  private checkSecretInitialized(secret = this.secret): void {
    if (!secret) {
      throw new Error("Secret is not provided");
    }
  }
}
