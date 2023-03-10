import { Identity } from "@semaphore-protocol/identity";

import { IdentityStrategy, IdentityWeb2Provider } from "@src/types";
import checkParameter from "@src/util/checkParameter";

import ZkIdentityDecorater from "./identityDecorater";

interface ICreateIdentityArgs {
  identityStrategy: IdentityStrategy;
  name: string;
  account: string;
  messageSignature?: string;
  web2Provider?: IdentityWeb2Provider;
}

function createInterrepIdentity(config: ICreateIdentityArgs): ZkIdentityDecorater {
  const { identityStrategy, web2Provider, name, messageSignature, account } = config;

  checkParameter(messageSignature, "messageSignature", "string");
  checkParameter(account, "account", "string");
  checkParameter(web2Provider, "web2Provider", "string");

  const identity = new Identity(messageSignature);

  return new ZkIdentityDecorater(identity, {
    account,
    name,
    identityStrategy,
    web2Provider,
  });
}

const createRandomIdentity = (config: ICreateIdentityArgs): ZkIdentityDecorater => {
  const { identityStrategy, name } = config;
  const identity = new Identity();

  return new ZkIdentityDecorater(identity, {
    account: "",
    name,
    identityStrategy,
  });
};

const strategiesMap = {
  random: createRandomIdentity,
  interrep: createInterrepIdentity,
};

const identityFactory = (strategy: keyof typeof strategiesMap, config: ICreateIdentityArgs): ZkIdentityDecorater =>
  strategiesMap[strategy](config);

export default identityFactory;
