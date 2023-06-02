export type EventHandler = (data: unknown) => void;
export type EventName = "login" | "identityChanged" | "logout" | "accountChanged";
export type Events = Record<EventName, EventHandler>;
