import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { ICreateIdentityArgs, IStrategiesMap } from "@cryptkeeperzk/types";

import { ZkIdentitySemaphore } from "../protocols";

const strategies = {
  random: createRandomIdentity,
  interep: createInterepIdentity,
};

export function createNewIdentity(strategy: keyof IStrategiesMap, config: ICreateIdentityArgs): ZkIdentitySemaphore {
  return strategies[strategy](config);
}

function createInterepIdentity(config: ICreateIdentityArgs): ZkIdentitySemaphore {
  const { identityStrategy, web2Provider, name, messageSignature, account, groups, host } = config;

  const identity = new Identity(messageSignature);

  return new ZkIdentitySemaphore(identity, {
    account,
    name,
    identityStrategy,
    web2Provider,
    groups,
    host,
  });
}

function createRandomIdentity(config: ICreateIdentityArgs): ZkIdentitySemaphore {
  const { identityStrategy, name, messageSignature, account, groups, host } = config;

  const identity = new Identity(messageSignature);

  return new ZkIdentitySemaphore(identity, {
    account,
    name,
    identityStrategy,
    groups,
    host,
  });
}
