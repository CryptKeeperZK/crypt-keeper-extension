import WalletService from "../wallet";
import SimpleStorage from "../simpleStorage";
import { browser } from "webextension-polyfill-ts";

jest.mock("../simpleStorage");

describe("background/services/wallet", () => {
    const service = new WalletService();
    const [walletStorage] = (SimpleStorage as jest.Mock).mock.instances;
    const defaultStorageValue = { isDisconnectedPermanently: false }

    test("should get connection", async () => {
        walletStorage.get.mockReturnValue(defaultStorageValue);

        const result = await service.getConnection();

        expect(result).toBe(defaultStorageValue);
    });

    test("should set connection", async () => {
        const newStorageValue = { isDisconnectedPermanently: true }

        walletStorage.get.mockReturnValue(newStorageValue);

        await service.setConnection(newStorageValue);
        const result = await service.getConnection();

        expect(result).toBe(newStorageValue);
    })
})