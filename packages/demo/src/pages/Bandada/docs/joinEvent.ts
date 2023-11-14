import { EventName, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const onJoinGroup = () => {};

client?.on(EventName.JOIN_GROUP, onJoinGroup);
