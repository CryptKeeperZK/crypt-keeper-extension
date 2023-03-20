import { deferredPromise } from "../utils";

describe("background/shared/utils", () => {
  test("should create deferred promise and resolve properly", () => {
    const { promise, resolve, reject } = deferredPromise();

    resolve?.(true);

    expect(promise).resolves.toBe(true);
    expect(typeof resolve === "function").toBe(true);
    expect(typeof reject === "function").toBe(true);
  });

  test("should create deferred promise and reject properly", () => {
    const { promise, resolve, reject } = deferredPromise();

    reject?.(false);

    expect(promise).rejects.toBe(false);
    expect(typeof resolve === "function").toBe(true);
    expect(typeof reject === "function").toBe(true);
  });
});
