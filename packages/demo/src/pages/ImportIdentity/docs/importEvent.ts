import { EventName, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const onImportIdentity = () => {};

client?.on(EventName.IMPORT_IDENTITY, onImportIdentity);
