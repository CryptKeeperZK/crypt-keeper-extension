import MiscStorageService, { InitializationStep } from "..";
import SimpleStorage from "../../storage";

jest.mock("../../storage");

type MockStorage = { get: jest.Mock; set: jest.Mock };

describe("background/services/wallet", () => {
  const service = MiscStorageService.getInstance();
  const [walletStorage, initializationStorage] = (SimpleStorage as jest.Mock).mock.instances as [
    MockStorage,
    MockStorage,
  ];
  const defaultWalletStorageValue = { isDisconnectedPermanently: false };
  const defaultInitializationStorageValue = { initializationStep: InitializationStep.MNEMONIC };

  test("should get connection", async () => {
    walletStorage.get.mockReturnValue(defaultWalletStorageValue);

    const result = await service.getConnection();

    expect(result).toStrictEqual(defaultWalletStorageValue);
  });

  test("should set connection", async () => {
    const newStorageValue = { isDisconnectedPermanently: true };

    await service.setConnection(newStorageValue);

    expect(walletStorage.set).toBeCalledTimes(1);
    expect(walletStorage.set).toBeCalledWith(newStorageValue);
  });

  test("should get initialization", async () => {
    initializationStorage.get.mockResolvedValue(defaultInitializationStorageValue);

    const result = await service.getInitialization();

    expect(result).toStrictEqual(defaultInitializationStorageValue.initializationStep);
  });

  test("should get default initialization", async () => {
    initializationStorage.get.mockResolvedValue(undefined);

    const result = await service.getInitialization();

    expect(result).toStrictEqual(InitializationStep.NEW);
  });

  test("should set connection", async () => {
    const newStorageValue = { initializationStep: InitializationStep.NEW };

    await service.setInitialization(newStorageValue);

    expect(initializationStorage.set).toBeCalledTimes(1);
    expect(initializationStorage.set).toBeCalledWith(newStorageValue);
  });
});
