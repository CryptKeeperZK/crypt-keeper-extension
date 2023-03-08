import WalletService from "../wallet";
import SimpleStorage from "../simpleStorage";

jest.mock("../simpleStorage");

describe("background/services/wallet", () => {
  const service = new WalletService();
  const [walletStorage] = (SimpleStorage as jest.Mock).mock.instances;
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
