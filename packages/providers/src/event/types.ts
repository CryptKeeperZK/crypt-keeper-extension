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
 * @property {string} VERIFIABLE_CREDENTIAL_REQUEST - "verifiableCredentialRequest"
 * @property {string} NEW_VERIFIABLE_CREDENTIAL - "newVerifiableCredential"
 * @property {string} VERIFIABLE_PRESENTATION_REQUEST - "verifiablePresentationRequest"
 * @property {string} NEW_VERIFIABLE_PRESENTATION - "newVerifiablePresentation"
 * @property {string} REVEAL_COMMITMENT - "revealCommitment"
 * @property {string} JOIN_GROUP - "joinGroup"
 * @property {string} GROUP_MERKLE_PROOF - "groupMerkleProof"
 * @property {string} USER_REJECT - "userReject"
 */
export enum EventName {
  LOGIN = "login",
  IDENTITY_CHANGED = "identityChanged",
  LOGOUT = "logout",
  VERIFIABLE_CREDENTIAL_REQUEST = "verifiableCredentialRequest",
  NEW_VERIFIABLE_CREDENTIAL = "newVerifiableCredential",
  VERIFIABLE_PRESENTATION_REQUEST = "verifiablePresentationRequest",
  NEW_VERIFIABLE_PRESENTATION = "newVerifiablePresentation",
  REVEAL_COMMITMENT = "revealCommitment",
  JOIN_GROUP = "joinGroup",
  GROUP_MERKLE_PROOF = "groupMerkleProof",
  USER_REJECT = "userReject",
}

/**
 * Represents the events object that maps event names to event handlers.
 *
 * @type {Events}
 * @typedef {Record<EventName, EventHandler>} Events
 */
export type Events = Record<EventName, EventHandler>;
