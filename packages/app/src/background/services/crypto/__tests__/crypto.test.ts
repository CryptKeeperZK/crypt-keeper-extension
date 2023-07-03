import fc from "fast-check";

import CryptoService from "..";

describe("background/services/crypto", () => {
  test("should encrypt and decrypt data properly", () => {
    const service = new CryptoService();

    expect(() => service.encrypt("text")).toThrow("Secret is not provided");
    expect(() => service.decrypt("text")).toThrow("Secret is not provided");
    expect(() => service.encrypt("text", "")).toThrow("Secret is not provided");
    expect(() => service.decrypt("text", "")).toThrow("Secret is not provided");

    fc.assert(
      fc.property(fc.string(), fc.string(), (text, password) => {
        fc.pre(password !== "");

        service.setSecret(password);

        const encrypted = service.encrypt(text);
        const decrypted = service.decrypt(encrypted);
        const encryptedWithPassword = service.encrypt(text, password);
        const decryptedWithPassword = service.decrypt(encryptedWithPassword, password);

        return decrypted === text && decryptedWithPassword === text;
      }),
    );
  });

  test("should check hmac properly", () => {
    const service = new CryptoService();

    expect(() => service.generateEncryptedHmac("text")).toThrow("Secret is not provided");
    expect(() => service.getAuthenticCiphertext("text")).toThrow("Secret is not provided");
    expect(() => service.getAuthenticCiphertext("text", "password")).toThrow("This ciphertext is not authentic");

    fc.assert(
      fc.property(fc.string(), fc.string(), (text, password) => {
        fc.pre(password !== "");

        const encrypted = service.generateEncryptedHmac(text, password);
        const decrypted = service.getAuthenticCiphertext(encrypted, password);

        return decrypted === text;
      }),
    );
  });
});
