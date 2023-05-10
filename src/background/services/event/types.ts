export type EventHandler = (data: unknown) => void;
export type EventName = "login" | "identityChanged" | "logout";
export type Events = Record<EventName, EventHandler[]>;
