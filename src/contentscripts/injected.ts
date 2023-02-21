/* eslint-disable @typescript-eslint/no-use-before-define */

import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import log from "loglevel";

import { MerkleProofArtifacts } from "@src/types";
import RPCAction from "@src/util/constants";
import { IRlnGenerateArgs, ISemaphoreGenerateArgs, RlnProofGenerator, SemaphoreProofGenerator } from "./proof";

export type IRequest = {
  method: string;
  payload?: any;
  error?: boolean;
  meta?: any;
};

const promises: {
  [k: string]: {
    resolve: (res?: unknown) => void;
    reject: (reason?: unknown) => void;
  };
} = {};

let nonce = 0;

async function getIdentityCommitments() {
  return post({
    method: RPCAction.GET_COMMITMENTS,
  });
}

async function getActiveIdentity() {
  return post({
    method: RPCAction.GET_ACTIVE_IDENTITY,
  });
}

async function getHostPermissions(host: string) {
  return post({
    method: RPCAction.GET_HOST_PERMISSIONS,
    payload: host,
  });
}

async function setHostPermissions(
  host: string,
  permissions?: {
    noApproval?: boolean;
  },
) {
  return post({
    method: RPCAction.SET_HOST_PERMISSIONS,
    payload: {
      host,
      ...permissions,
    },
  });
}

async function createIdentity() {
  try {
    const res = await post({
      method: RPCAction.CREATE_IDENTITY_REQ,
    });

    await post({ method: RPCAction.CLOSE_POPUP });
    return res;
  } catch (e) {
    await post({ method: RPCAction.CLOSE_POPUP });
    throw e;
  }
}

async function createDummyRequest() {
  try {
    const res = await post({
      method: RPCAction.DUMMY_REQUEST,
    });

    await post({ method: RPCAction.CLOSE_POPUP });
    return res;
  } catch (e) {
    await post({ method: RPCAction.CLOSE_POPUP });
    throw e;
  }
}

async function semaphoreProof(
  externalNullifier: string,
  signal: string,
  circuitFilePath: string,
  zkeyFilePath: string,
  merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
  merkleProof?: MerkleProof,
) {
  const merkleProofArtifacts =
    typeof merkleProofArtifactsOrStorageAddress === "string" ? undefined : merkleProofArtifactsOrStorageAddress;
  const merkleStorageAddress =
    typeof merkleProofArtifactsOrStorageAddress === "string" ? merkleProofArtifactsOrStorageAddress : undefined;

  const request = await post({
    method: RPCAction.PREPARE_SEMAPHORE_PROOF_REQUEST,
    payload: {
      externalNullifier,
      signal,
      merkleStorageAddress,
      circuitFilePath,
      zkeyFilePath,
      merkleProofArtifacts,
      merkleProof,
    },
  });

  return SemaphoreProofGenerator.getInstance().generate(request as ISemaphoreGenerateArgs);
}

async function rlnProof(
  externalNullifier: string,
  signal: string,
  circuitFilePath: string,
  zkeyFilePath: string,
  merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
  rlnIdentifier: string,
) {
  const merkleProofArtifacts =
    typeof merkleProofArtifactsOrStorageAddress === "string" ? undefined : merkleProofArtifactsOrStorageAddress;
  const merkleStorageAddress =
    typeof merkleProofArtifactsOrStorageAddress === "string" ? merkleProofArtifactsOrStorageAddress : undefined;

  const request = await post({
    method: RPCAction.PREPARE_RLN_PROOF_REQUEST,
    payload: {
      externalNullifier,
      signal,
      merkleStorageAddress,
      circuitFilePath,
      zkeyFilePath,
      merkleProofArtifacts,
      rlnIdentifier,
    },
  });

  return RlnProofGenerator.getInstance().generate(request as IRlnGenerateArgs);
}

// dev-only
async function clearApproved() {
  return post({
    method: RPCAction.CLEAR_APPROVED_HOSTS,
  });
}

/**
 * Open Popup
 */
async function openPopup() {
  return post({
    method: "OPEN_POPUP",
  });
}

async function tryInject(origin: string) {
  return post({
    method: RPCAction.TRY_INJECT,
    payload: { origin },
  });
}

async function addHost(host: string) {
  return post({
    method: RPCAction.APPROVE_HOST,
    payload: { host },
  });
}

const EVENTS: {
  [eventName: string]: ((data: unknown) => void)[];
} = {};

const on = (eventName: string, cb: (data: unknown) => void) => {
  const bucket = EVENTS[eventName] || [];
  bucket.push(cb);
  EVENTS[eventName] = bucket;
};

const off = (eventName: string, cb: (data: unknown) => void) => {
  const bucket = EVENTS[eventName] || [];
  EVENTS[eventName] = bucket.filter(callback => callback === cb);
};

const emit = (eventName: string, payload?: any) => {
  const bucket = EVENTS[eventName] || [];

  for (const cb of bucket) {
    cb(payload);
  }
};

/**
 * Injected Client
 */
const client = {
  openPopup,
  getIdentityCommitments,
  getActiveIdentity,
  createIdentity,
  getHostPermissions,
  setHostPermissions,
  semaphoreProof,
  rlnProof,
  on,
  off,
  // dev-only
  clearApproved,
  createDummyRequest,
};

/**
 * Connect to Extension
 * @returns injected client
 */
// eslint-disable-next-line consistent-return
async function connect() {
  let result;
  try {
    const approved = await tryInject(window.location.origin);

    if (approved) {
      await addHost(window.location.origin);
      result = client;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    log.debug("Err: ", err);
    result = null;
  }

  await post({ method: RPCAction.CLOSE_POPUP });

  return result;
}

declare global {
  interface Window {
    zkpr: {
      connect: () => any;
    };
  }
}

window.zkpr = {
  connect,
};

// Connect injected script messages with content script messages
async function post(message: IRequest) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-plusplus
    const messageNonce = nonce++;
    window.postMessage(
      {
        target: "injected-contentscript",
        message: {
          ...message,
          meta: {
            ...message.meta,
            origin: window.location.origin,
          },
          type: message.method,
        },
        nonce: messageNonce,
      },
      "*",
    );

    promises[messageNonce] = { resolve, reject };
  });
}

window.addEventListener("message", event => {
  const { data } = event;

  if (data && data.target === "injected-injectedscript") {
    if (data.nonce === "identityChanged") {
      const [, res] = data.payload;
      emit("identityChanged", res);
      return;
    }

    if (data.nonce === "logout") {
      const [, res] = data.payload;
      emit("logout", res);
      return;
    }

    if (data.nonce === "login") {
      const [, res] = data.payload;
      emit("login", res);
      return;
    }

    if (!promises[data.nonce]) return;

    const [err, res] = data.payload;
    const { resolve, reject } = promises[data.nonce];

    if (err) {
      // eslint-disable-next-line consistent-return
      return reject(new Error(err));
    }

    resolve(res);

    delete promises[data.nonce];
  }
});
