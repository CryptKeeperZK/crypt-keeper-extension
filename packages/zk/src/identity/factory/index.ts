import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { ICreateIdentityArgs } from "@cryptkeeperzk/types";

import { ZkIdentitySemaphore } from "../protocols";

export function createNewIdentity(config: ICreateIdentityArgs): ZkIdentitySemaphore {
  const { name, messageSignature, account, groups, host, isDeterministic } = config;

  const identity = new Identity(messageSignature);

  return new ZkIdentitySemaphore(identity, {
    account,
    name,
    groups,
    host,
    isDeterministic,
  });
}
