import fc from "fast-check";

import { cryptoEncrypt, cryptoDecrypt, cryptoGenerateEncryptedHmac, cryptoGetAuthenticBackupCiphertext } from "..";

describe("background/services/crypto", () => {
  test("should encrypt and decrypt data properly", () => {
    expect(() => cryptoEncrypt("text", "")).toThrow("Password is not provided");
    expect(() => cryptoDecrypt("text", "")).toThrow("Password is not provided");

    fc.assert(
      fc.property(fc.string(), fc.string(), (text, password) => {
        fc.pre(password !== "");

        const encrypted = cryptoEncrypt(text, password);
        const decrypted = cryptoDecrypt(encrypted, password);

        return decrypted === text;
      }),
    );
  });

  test("should check hmac properly", () => {
    expect(() => cryptoGetAuthenticBackupCiphertext("text", "")).toThrow("Backup password is not provided");
    expect(() => cryptoGetAuthenticBackupCiphertext("text", "password")).toThrow("This backup file is not authentic");

    fc.assert(
      fc.property(fc.string(), fc.string(), (text, password) => {
        fc.pre(password !== "");

        const encrypted = cryptoGenerateEncryptedHmac(text, password);
        const decrypted = cryptoGetAuthenticBackupCiphertext(encrypted, password);

        return decrypted === text;
      }),
    );
  });
});
