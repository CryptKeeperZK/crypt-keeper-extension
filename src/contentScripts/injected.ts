import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import log from "loglevel";

import { RPCAction } from "@src/constants";
import { InjectedMessageData, MerkleProofArtifacts } from "@src/types";

import { IRlnGenerateArgs, ISemaphoreGenerateArgs, RlnProofGenerator, SemaphoreProofGenerator } from "./proof";
import { SelectedIdentity } from "@src/ui/ducks/identities";

export type IRequest = {
  method: string;
  payload?: unknown;
  error?: boolean;
  meta?: Record<string, unknown>;
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
    method: RPCAction.GET_ACTIVE_IDENTITY_DATA,
  }) as Promise<SelectedIdentity>;
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
  return post({
    method: RPCAction.CREATE_IDENTITY_REQ,
  });
}

async function semaphoreProof(
  externalNullifier: string,
  signal: string,
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
      merkleProofArtifacts,
      merkleProof,
    },
  });

  return SemaphoreProofGenerator.getInstance().generate(request as ISemaphoreGenerateArgs);
}

async function rlnProof(
  externalNullifier: string,
  signal: string,
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

interface Approvals {
  isApproved: boolean;
  canSkipApprove: boolean;
}

async function tryInject(host: string): Promise<Approvals> {
  return post({
    method: RPCAction.TRY_INJECT,
    payload: { origin: host },
  }) as Promise<Approvals>;
}

async function addHost(host: string, noApproval: boolean) {
  return post({
    method: RPCAction.APPROVE_HOST,
    payload: { host, noApproval },
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
  EVENTS[eventName] = bucket.filter((callback) => callback === cb);
};

const emit = (eventName: string, payload?: unknown) => {
  const bucket = EVENTS[eventName] || [];

  bucket.forEach((cb) => cb(payload));
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
};

export type Client = typeof client;

/**
 * Connect to Extension
 * @returns injected client
 */

async function connect(): Promise<Client | null> {
  let result: Client | null = null;
  try {
    const { isApproved, canSkipApprove } = await tryInject(window.location.origin);

    if (isApproved) {
      await addHost(window.location.origin, canSkipApprove);
      result = client;
    }
  } catch (err) {
    log.debug("Err: ", err);
    result = null;
  }

  await post({ method: RPCAction.CLOSE_POPUP });

  return result;
}

declare global {
  interface Window {
    zkpr?: {
      connect: () => Promise<Client | null>;
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

window.addEventListener("message", (event: MessageEvent<InjectedMessageData>) => {
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
