export declare type IdentityStrategy = "interrep" | "random";
export declare type IdentityWeb2Provider = "twitter" | "github" | "reddit";
export declare type CreateIdentityOptions = {
    nonce?: number;
    web2Provider?: IdentityWeb2Provider;
    account?: string;
    name?: string;
};
export declare type NewIdentityRequest = {
    strategy: IdentityStrategy;
    messageSignature: string;
    options: CreateIdentityOptions;
};
export declare type IdentityMetadata = {
    account: string;
    name: string;
    identityStrategy: IdentityStrategy;
    web2Provider?: IdentityWeb2Provider;
};
export interface IdentityData {
    commitment: string;
    metadata: IdentityMetadata;
}
export declare type IdentityName = {
    identityCommitment: string;
    name: string;
};
export declare type SerializedIdentity = {
    metadata: IdentityMetadata;
    secret: string;
};
export interface ICreateIdentityArgs {
    identityStrategy: IdentityStrategy;
    name: string;
    account: string;
    messageSignature?: string;
    web2Provider?: IdentityWeb2Provider;
}
export declare type StrategiesMap = {
    random: (config: ICreateIdentityArgs) => void;
    interrep: (config: ICreateIdentityArgs) => void;
};
