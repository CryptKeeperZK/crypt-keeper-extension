// TODO: write unit tests for Crypto service
import { AES, enc, HmacSHA256, SHA256 } from "crypto-js";

export function cryptoEncrypt(text: string, password: string): string {
  return AES.encrypt(text, password).toString();
}

export function cryptoDecrypt(cipherText: string, password: string): string {
  const bytes = AES.decrypt(cipherText, password);
  return bytes.toString(enc.Utf8);
}

export function cryptoGenerateEncryptedHmac(cipherText: string, password: string): string {
  const hmac = generateHmac(cipherText, password);
  return `${hmac}${cipherText}`;
}

export function cryptoGetAuthenticBackupCiphertext(backupCipherText: string, backupPassword: string): string {
  const isAuthentic = isBackupHmacAuthentic(backupCipherText, backupPassword);

  if (!isAuthentic) {
    throw new Error("This backup file is not authentic.");
  }

  const { transitCipherContent } = cryptoSubHmacCiphertext(backupCipherText);

  return transitCipherContent;
}

function isBackupHmacAuthentic(cipherText: string, backupPassword: string): boolean {
  if (!backupPassword) {
    throw new Error("Backup password is not provided");
  }

  return isCryptoHmacAuthentic(cipherText, backupPassword);
}

function isCryptoHmacAuthentic(cipherText: string, password: string): boolean {
  const { transitHmac, transitCipherContent } = cryptoSubHmacCiphertext(cipherText);

  const decryptedHmac = generateHmac(transitCipherContent, password);

  return transitHmac === decryptedHmac;
}

function cryptoSubHmacCiphertext(cipherText: string): { transitHmac: string; transitCipherContent: string } {
  const transitHmac = cipherText.substring(0, 64);
  const transitCipherContent = cipherText.substring(64);

  return {
    transitHmac,
    transitCipherContent,
  };
}

function generateHmac(cipherText: string, password: string): string {
  return HmacSHA256(cipherText, SHA256(password)).toString();
}
