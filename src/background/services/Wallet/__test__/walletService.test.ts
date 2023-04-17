import { SimpleStorageService } from "@src/background/services/Storage";
import { WalletService } from "@src/background/services/Wallet";

jest.mock("@src/background/services/Storage/SimpleStorage");

describe("background/services/wallet", () => {
  const service = new WalletService();
  const [walletStorage] = (SimpleStorageService as jest.Mock).mock.instances as [{ get: jest.Mock; set: jest.Mock }];
  const defaultStorageValue = { isDisconnectedPermanently: false };

  test("should get connection", async () => {
    walletStorage.get.mockReturnValue(defaultStorageValue);

    const result = await service.getConnection();

    expect(result).toStrictEqual(defaultStorageValue);
  });

  test("should set connection", async () => {
    const newStorageValue = { isDisconnectedPermanently: true };

    await service.setConnection(newStorageValue);

    expect(walletStorage.set).toBeCalledTimes(1);
    expect(walletStorage.set).toBeCalledWith(newStorageValue);
  });
});
