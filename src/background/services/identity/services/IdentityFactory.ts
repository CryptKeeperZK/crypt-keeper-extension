import { Identity } from "@semaphore-protocol/identity";

import checkParameter from "@src/util/checkParameter";

import { IdentityDecoraterService } from "./IdentityDecorater";
import { ICreateIdentityArgs, StrategiesMap } from "@src/types";

export class IdentityFactoryService {
  protected createNewIdentity = (
    strategy: keyof StrategiesMap,
    config: ICreateIdentityArgs,
  ): IdentityDecoraterService => this.strategiesMap[strategy](config);

  private createInterrepIdentity = (config: ICreateIdentityArgs): IdentityDecoraterService => {
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

  private createRandomIdentity = (config: ICreateIdentityArgs): IdentityDecoraterService => {
    const { identityStrategy, name } = config;
    const identity = new Identity();

    return new IdentityDecoraterService(identity, {
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
