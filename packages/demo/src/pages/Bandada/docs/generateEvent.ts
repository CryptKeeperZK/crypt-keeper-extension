import { EventName, initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const onGroupMerkleProof = () => {};

client?.on(EventName.GROUP_MERKLE_PROOF, onGroupMerkleProof);
