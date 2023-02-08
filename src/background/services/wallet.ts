import SimpleStorage from "./simple-storage";

const key = "@wallet@";

class WalletService extends SimpleStorage {
  //private wallet: WalletInfoBackgound;

  constructor() {
    super(key);
  }
}
