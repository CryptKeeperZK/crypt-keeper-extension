import { CryptKeeperInjectedProvider } from "./sdk/Base";
declare global {
    interface Window {
        cryptkeeper: CryptKeeperInjectedProvider;
    }
}
export declare function initializeInjectedProvider(): void;
export declare function setGlobalInjectedPrivider(injectedProvider: CryptKeeperInjectedProvider): void;
