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
 * @property {string} ADD_VERIFIABLE_CREDENTIAL - "addVerifiableCredential"
 * @property {string} REJECT_VERIFIABLE_CREDENTIAL - "rejectVerifiableCredential"
 * @property {string} GENERATE_VERIFIABLE_PRESENTATION - "generateVerifiablePresentation"
 * @property {string} REJECT_VERIFIABLE_PRESENTATION_REQUEST - "rejectVerifiablePresentationRequest"
 */
export enum EventName {
  LOGIN = "login",
  IDENTITY_CHANGED = "identityChanged",
  LOGOUT = "logout",
  ADD_VERIFIABLE_CREDENTIAL = "addVerifiableCredential",
  REJECT_VERIFIABLE_CREDENTIAL = "rejectVerifiableCredential",
  GENERATE_VERIFIABLE_PRESENTATION = "generateVerifiablePresentation",
  REJECT_VERIFIABLE_PRESENTATION_REQUEST = "rejectVerifiablePresentationRequest",
  REVEAL_COMMITMENT = "revealCommitment",
}

/**
 * Represents the events object that maps event names to event handlers.
 *
 * @type {Events}
 * @typedef {Record<EventName, EventHandler>} Events
 */
export type Events = Record<EventName, EventHandler>;
