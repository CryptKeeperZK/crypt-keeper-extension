/**
 * This script add properties in globalThis and initialises them with undefined.
 * This is workaround needed to avoid error in dependencies expecting to be run in a browser
 * these dependencies are not available to service worker in MV3.
 */

const keys = ["XMLHttpRequest"];

keys.forEach(key => {
  if (!Reflect.has(globalThis, key)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis[key] = undefined;
  }
});

if (!Reflect.has(globalThis, "window")) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.window = globalThis;
}

export {};
