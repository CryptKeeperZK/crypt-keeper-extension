/**
 * Represents an event handler function.
 *
 * @callback EventHandler
 * @param {unknown} data - The data passed to the event handler.
 * @returns {void}
 */
export type EventHandler = (data: unknown) => void;

/**
 * Enumeration representing possible event names.
 *
 * @enum {string}
 * @readonly
 * @property {string} LOGIN - "login"
 * @property {string} IDENTITY_CHANGED - "identityChanged"
 * @property {string} LOGOUT - "logout"
 * @property {string} APPROVAL - "approval"
 * @property {string} ADD_VERIFIABLE_CREDENTIAL - "addVerifiableCredential"
 * @property {string} VERIFIABLE_PRESENTATION_REQUEST - "verifiablePresentationRequest"
 * @property {string} GENERATE_VERIFIABLE_PRESENTATION - "generateVerifiablePresentation"
 * @property {string} REVEAL_COMMITMENT - "revealCommitment"
 * @property {string} JOIN_GROUP - "joinGroup"
 * @property {string} GROUP_MERKLE_PROOF - "groupMerkleProof"
 * @property {string} IMPORT_IDENTITY - "importIdentity"
 * @property {string} CREATE_IDENTITY - "createIdentity"
 * @property {string} CONNECT_IDENTITY - "connectIdentity"
 * @property {string} DISCONNECT_IDENTITY - "disconnectIdentity"
 * @property {string} USER_REJECT - "userReject"
 */
export enum EventName {
  LOGIN = "login",
  IDENTITY_CHANGED = "identityChanged",
  LOGOUT = "logout",
  APPROVAL = "approval",
  ADD_VERIFIABLE_CREDENTIAL = "addVerifiableCredential",
  VERIFIABLE_PRESENTATION_REQUEST = "verifiablePresentationRequest",
  GENERATE_VERIFIABLE_PRESENTATION = "generateVerifiablePresentation",
  REVEAL_COMMITMENT = "revealCommitment",
  JOIN_GROUP = "joinGroup",
  GROUP_MERKLE_PROOF = "groupMerkleProof",
  IMPORT_IDENTITY = "importIdentity",
  CREATE_IDENTITY = "createIdentity",
  CONNECT_IDENTITY = "connectIdenity",
  DISCONNECT_IDENTITY = "disconnectIdentity",
  USER_REJECT = "userReject",
}

/**
 * Represents the events object that maps event names to event handlers.
 *
 * @type {Events}
 * @typedef {Record<EventName, EventHandler>} Events
 */
export type Events = Record<EventName, EventHandler>;
