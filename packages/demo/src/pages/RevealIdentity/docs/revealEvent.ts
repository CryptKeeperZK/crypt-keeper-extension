import { EventName, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const onRevealCommitment = () => {};

client?.on(EventName.REVEAL_COMMITMENT, onRevealCommitment);
