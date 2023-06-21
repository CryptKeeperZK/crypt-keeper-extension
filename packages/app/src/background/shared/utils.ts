import { DeferredPromise } from "@src/types";

/**
 * @src Metamask extension
 * A deferred Promise.
 *
 * A deferred Promise is one that can be resolved or rejected independently of
 * the Promise construction.
 *
 * @typedef {object} DeferredPromise
 * @property {Promise} promise - The Promise that has been deferred.
 * @property {() => void} resolve - A function that resolves the Promise.
 * @property {() => void} reject - A function that rejects the Promise.
 */

/**
 * Create a defered Promise.
 *
 * @returns {DeferredPromise} A deferred Promise.
 */
export function deferredPromise<T>(): DeferredPromise<T> {
  let resolve: DeferredPromise<T>["resolve"];
  let reject: DeferredPromise<T>["reject"];

  const promise: Promise<T> = new Promise((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return { promise, resolve, reject };
}
