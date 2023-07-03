import fc from "fast-check";

import { defaultMnemonic } from "@src/config/mock/wallet";

import CryptoService from "..";

describe("background/services/crypto", () => {
  const service = CryptoService.getInstance();

  afterEach(() => {
    service.clear();
  });

  test("should set mnemonic properly", () => {
    expect(() => service.setMnemonic(defaultMnemonic)).not.toThrow();
  });

  test("should throw error if mnemonic is invalid", () => {
    expect(() => service.setMnemonic("invalid")).toThrow("Mnemonic is invalid");
  });

  test("should encrypt and decrypt data properly", () => {
    expect(() => service.encrypt("text")).toThrow("Password is not provided");
    expect(() => service.decrypt("text")).toThrow("Password is not provided");
    expect(() => service.encrypt("text", "")).toThrow("Password is not provided");
    expect(() => service.decrypt("text", "")).toThrow("Password is not provided");

    fc.assert(
      fc.property(fc.string(), fc.string(), (text, password) => {
        fc.pre(password !== "");

        service.setPassword(password);

        const encrypted = service.encrypt(text);
        const decrypted = service.decrypt(encrypted);
        const encryptedWithPassword = service.encrypt(text, password);
        const decryptedWithPassword = service.decrypt(encryptedWithPassword, password);

        return decrypted === text && decryptedWithPassword === text;
      }),
    );
  });

  test("should check hmac properly", () => {
    expect(() => service.generateEncryptedHmac("text", "")).toThrow("Password is not provided");
    expect(() => service.getAuthenticCiphertext("text", "")).toThrow("Password is not provided");

    service.setPassword("password");
    expect(() => service.getAuthenticCiphertext("text", "password")).toThrow("This ciphertext is not authentic");
    expect(() => service.getAuthenticCiphertext("text", "wrong")).toThrow("Password doesn't match with current");

    fc.assert(
      fc.property(fc.string(), fc.string(), (text, password) => {
        fc.pre(password !== "");

        service.setPassword(password);

        const encrypted = service.generateEncryptedHmac(text, password);
        const decrypted = service.getAuthenticCiphertext(encrypted, password);

        return decrypted === text;
      }),
    );
  });
});
