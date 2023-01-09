import { WalletInfoBackgound } from "@src/types";
import SimpleStorage from "./simple-storage";

const key: string = '@wallet@'

class WalletService extends SimpleStorage {
    //private wallet: WalletInfoBackgound;

    constructor() {
        super(key);
    }
}