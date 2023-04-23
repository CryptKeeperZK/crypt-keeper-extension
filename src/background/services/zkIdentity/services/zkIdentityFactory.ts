import { Identity } from "@semaphore-protocol/identity";

import { ICreateIdentityArgs, StrategiesMap } from "@src/types";
import checkParameter from "@src/util/checkParameter";

import { ZkIdentityDecorater } from "./zkIdentityDecorater";

export class ZkIdentityFactoryService {
  protected createNewIdentity = (strategy: keyof StrategiesMap, config: ICreateIdentityArgs): ZkIdentityDecorater =>
    this.strategiesMap[strategy](config);

  private createInterrepIdentity = (config: ICreateIdentityArgs): ZkIdentityDecorater => {
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
  };

  private createRandomIdentity = (config: ICreateIdentityArgs): ZkIdentityDecorater => {
    const { identityStrategy, name } = config;
    const identity = new Identity();

    return new ZkIdentityDecorater(identity, {
      account: "",
      name,
      identityStrategy,
    });
  };

  private readonly strategiesMap = {
    random: this.createRandomIdentity,
    interrep: this.createInterrepIdentity,
  };
}
