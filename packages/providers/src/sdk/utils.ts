/**
 * Stores promises associated with message nonces.
 */
export const promises: {
  [k: string]: {
    resolve: (res?: unknown) => void;
    reject: (reason?: unknown) => void;
  };
} = {};
