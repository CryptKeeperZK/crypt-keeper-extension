/**
 * Represents an event handler function.
 *
 * @callback EventHandler
 * @param {unknown} data - The data passed to the event handler.
 * @returns {void}
 */
export type EventHandler = (data: unknown) => void;

/**
 * Represents the name of an event.
 *
 * @type {EventName}
 * @typedef {("login" | "identityChanged" | "logout")} EventName
 */
export type EventName = "login" | "identityChanged" | "logout";

/**
 * Represents the events object that maps event names to event handlers.
 *
 * @type {Events}
 * @typedef {Record<EventName, EventHandler>} Events
 */
export type Events = Record<EventName, EventHandler>;
