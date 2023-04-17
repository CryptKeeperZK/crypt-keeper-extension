import { Identity } from "@semaphore-protocol/identity";

import checkParameter from "@src/util/checkParameter";

import { IdentityDecoraterService } from "./IdentityDecorater";
import { ICreateIdentityArgs } from "./interface";

function createInterrepIdentity(config: ICreateIdentityArgs): IdentityDecoraterService {
  const { identityStrategy, web2Provider, name, messageSignature, account } = config;

  checkParameter(messageSignature, "messageSignature", "string");
  checkParameter(account, "account", "string");
  checkParameter(web2Provider, "web2Provider", "string");

  const identity = new Identity(messageSignature);

  return new IdentityDecoraterService(identity, {
    account,
    name,
    identityStrategy,
    web2Provider,
  });
}

const createRandomIdentity = (config: ICreateIdentityArgs): IdentityDecoraterService => {
  const { identityStrategy, name } = config;
  const identity = new Identity();

  return new IdentityDecoraterService(identity, {
    account: "",
    name,
    identityStrategy,
  });
};

const strategiesMap = {
  random: createRandomIdentity,
  interrep: createInterrepIdentity,
};

// TODO: convert to IdentityFactorService class
export const identityFactory = (
  strategy: keyof typeof strategiesMap,
  config: ICreateIdentityArgs,
): IdentityDecoraterService => strategiesMap[strategy](config);
