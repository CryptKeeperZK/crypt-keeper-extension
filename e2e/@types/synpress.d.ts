declare module "@synthetixio/synpress/helpers" {
  export function prepareMetamask(version: string): Promise<string>;
}

declare module "@synthetixio/synpress/commands/metamask" {
  export function initialSetup(
    browser: unknown,
    options: {
      secretWordsOrPrivateKey: string;
      network: string;
      password: string;
      enableAdvancedSettings: boolean;
    },
  ): Promise<void>;

  export function acceptAccess(): Promise<void>;
}
