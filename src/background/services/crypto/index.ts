// TODO: write unit tests for Crypto service
import { AES, enc, HmacSHA256, SHA256 } from "crypto-js";

export function cryptoEncrypt(text: string, password: string): string {
  return AES.encrypt(text, password).toString();
}

export function cryptoDecrypt(ciphertext: string, password: string): string {
  const bytes = AES.decrypt(ciphertext, password);
  return bytes.toString(enc.Utf8);
}

export function cryptoGenerateEncryptedHmac(ciphertext: string, password: string): string {
  const hmac = generateHmac(ciphertext, password);
  return `${hmac}${ciphertext}`;
}

function generateHmac(ciphertext: string, password: string): string {
  return HmacSHA256(ciphertext, SHA256(password)).toString();
}

export function isCryptoHmacAuthentic(ciphertext: string, password: string): boolean {
  const { transitHmac, transitCipherContent } = cryptoSubHmacCiphertext(ciphertext);

  const decryptedHmac = generateHmac(transitCipherContent, password);

  return transitHmac === decryptedHmac;
}

export function cryptoSubHmacCiphertext(ciphertext: string): { transitHmac: string; transitCipherContent: string } {
  const transitHmac = ciphertext.substring(0, 64);
  const transitCipherContent = ciphertext.substring(64);

  return {
    transitHmac,
    transitCipherContent,
  };
}

export function cryptoGetAuthenticBackupCiphertext(backupCiphertext: string, backupPassword: string): string {
  const isAuthentic = isBackupHmacAuthentic(backupCiphertext, backupPassword);
  if (!isAuthentic) throw new Error("This backup file is not authentic.");
  const { transitCipherContent: authenticCiphertext } = cryptoSubHmacCiphertext(backupCiphertext);
  return authenticCiphertext;
}

function isBackupHmacAuthentic(ciphertext: string, backupPassword: string): boolean {
  if (!backupPassword) throw new Error("Backup Password is not provided");
  return isCryptoHmacAuthentic(ciphertext, backupPassword);
}
