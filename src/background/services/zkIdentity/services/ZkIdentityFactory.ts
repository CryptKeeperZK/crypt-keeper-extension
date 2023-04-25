import { Identity } from "@semaphore-protocol/identity";

import { ICreateIdentityArgs, StrategiesMap } from "@src/types";

import { ZkIdentitySemaphore } from "../protocols/ZkIdentitySemaphore";

export class ZkIdentityFactoryService {
  protected createNewIdentity = (strategy: keyof StrategiesMap, config: ICreateIdentityArgs): ZkIdentitySemaphore =>
    ({
      random: this.createRandomIdentity,
      interrep: this.createInterrepIdentity,
    }[strategy](config));

  private createInterrepIdentity = (config: ICreateIdentityArgs): ZkIdentitySemaphore => {
    const { identityStrategy, web2Provider, name, messageSignature, account } = config;

    const identity = new Identity(messageSignature);

    return new ZkIdentitySemaphore(identity, {
      account,
      name,
      identityStrategy,
      web2Provider,
    });
  };

  private createRandomIdentity = (config: ICreateIdentityArgs): ZkIdentitySemaphore => {
    const { identityStrategy, name } = config;
    const identity = new Identity();

    return new ZkIdentitySemaphore(identity, {
      account: "",
      name,
      identityStrategy,
    });
  };
}
