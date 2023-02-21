import { IdentityMetadata } from "@src/types";
import { Identity } from "@semaphore-protocol/identity";
import checkParameter from "@src/util/checkParameter";
import ZkIdentityDecorater from "./identity-decorater";
import log from "loglevel";

async function createInterrepIdentity(config: any): Promise<ZkIdentityDecorater> {
  checkParameter(config, "config", "object");

  const { web2Provider, name, messageSignature, account } = config;

  checkParameter(name, "name", "string");
  checkParameter(web2Provider, "provider", "string");
  checkParameter(messageSignature, "messageSignature", "string");

  log.debug("createInterrepIdentity: 4");
  const identity: Identity = new Identity(messageSignature);

  log.debug("createInterrepIdentity: 5");
  const metadata: IdentityMetadata = {
    account,
    name,
    web2Provider,
  };

  return new ZkIdentityDecorater(identity, metadata);
}

const createRandomIdentity = (config: any): ZkIdentityDecorater => {
  checkParameter(config, "config", "object");
  const { web2Provider, name } = config;

  checkParameter(name, "name", "string");

  const identity: Identity = new Identity();
  const metadata: IdentityMetadata = {
    account: "",
    name,
    web2Provider,
  };

  return new ZkIdentityDecorater(identity, metadata);
};

const strategiesMap = {
  random: createRandomIdentity,
  interrep: createInterrepIdentity,
};

const identityFactory = async (strategy: keyof typeof strategiesMap, config: any): Promise<ZkIdentityDecorater> =>
  strategiesMap[strategy](config);

export default identityFactory;
