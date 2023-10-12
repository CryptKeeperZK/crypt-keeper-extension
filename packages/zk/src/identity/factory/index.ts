import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { ICreateIdentityArgs } from "@cryptkeeperzk/types";

import { ZkIdentitySemaphore } from "../protocols";

export function createNewIdentity(config: ICreateIdentityArgs): ZkIdentitySemaphore {
  const { name, messageSignature, account, groups, urlOrigin, isDeterministic, nonce, trapdoor, nullifier } = config;
  const serialized = trapdoor && nullifier ? JSON.stringify([trapdoor, nullifier]) : undefined;

  const identity = new Identity(serialized || messageSignature);

  return new ZkIdentitySemaphore(identity, {
    account,
    name,
    groups,
    nonce,
    urlOrigin,
    isDeterministic,
    isImported: Boolean(serialized),
  });
}
