export declare type EventHandler = (data: unknown) => void;
export declare type EventName = "login" | "identityChanged" | "logout";
export declare type Events = Record<EventName, EventHandler>;
