/**
 * @jest-environment jsdom
 */

import { act, render } from "@testing-library/react";

import { ZERO_ADDRESS } from "@src/config/const";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { EWallet } from "@src/types";

import { AccountMenu, IAccountMenuProps } from "..";
import { IUseAccountMenuData, useAccountMenu } from "../useAccountMenu";

jest.mock("../useAccountMenu", (): unknown => ({
  useAccountMenu: jest.fn(),
}));

describe("ui/components/Header", () => {
  const defaulltProps: IAccountMenuProps = {
    ethWallet: defaultWalletHookData,
    cryptKeeperWallet: defaultWalletHookData,
  };

  const defaultHookData: IUseAccountMenuData = {
    isOpen: true,
    accounts: [
      { type: EWallet.CRYPTKEEPER_WALLET, address: ZERO_ADDRESS, active: true },
      { type: EWallet.ETH_WALLET, address: ZERO_ADDRESS, active: true },
    ],
    anchorEl: document.body,
    onConnect: jest.fn(),
    onDisconnect: jest.fn(),
    onLock: jest.fn(),
    onOpen: jest.fn(),
    onClose: jest.fn(),
    onGoToMetamaskPage: jest.fn(),
    onGoToSettings: jest.fn(),
    onSelectAccount: jest.fn(),
  };

  beforeEach(() => {
    (useAccountMenu as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { findByTestId } = render(<AccountMenu {...defaulltProps} />);

    const menu = await findByTestId("menu");

    expect(menu).toBeInTheDocument();
  });

  test("should render properly without connected wallet", async () => {
    const { findByText } = render(
      <AccountMenu {...defaulltProps} ethWallet={{ ...defaulltProps.ethWallet, isActive: false }} />,
    );

    const item = await findByText("Connect MetaMask");
    await act(async () => Promise.resolve(item.click()));

    expect(defaultHookData.onConnect).toBeCalledTimes(1);
  });

  test("should render properly activating state", async () => {
    const { findByTestId } = render(
      <AccountMenu {...defaulltProps} cryptKeeperWallet={{ ...defaulltProps.ethWallet, address: undefined }} />,
    );

    const loading = await findByTestId("address-loading");

    expect(loading).toBeInTheDocument();
  });

  test("should render without installed wallet", async () => {
    const { findByText } = render(
      <AccountMenu
        {...defaulltProps}
        ethWallet={{ ...defaulltProps.ethWallet, isActive: false, isInjectedWallet: false }}
      />,
    );

    const metamaskInstall = await findByText("Install MetaMask");
    await act(async () => Promise.resolve(metamaskInstall.click()));

    expect(defaultHookData.onGoToMetamaskPage).toBeCalledTimes(1);
  });

  test("should go to settings page", async () => {
    const { findByText } = render(<AccountMenu {...defaulltProps} />);

    const settings = await findByText("Settings");
    await act(async () => Promise.resolve(settings.click()));

    expect(defaultHookData.onGoToSettings).toBeCalledTimes(1);
  });

  test("should lock app properly", async () => {
    const { findByText } = render(<AccountMenu {...defaulltProps} />);

    const lock = await findByText("Lock");
    await act(async () => Promise.resolve(lock.click()));

    expect(defaultHookData.onLock).toBeCalledTimes(1);
  });

  test("should disconnect metamask properly", async () => {
    const { findByText } = render(
      <AccountMenu {...defaulltProps} ethWallet={{ ...defaultWalletHookData, isActive: true }} />,
    );

    const disconnect = await findByText("Disconnect MetaMask");
    await act(async () => Promise.resolve(disconnect.click()));

    expect(defaultHookData.onDisconnect).toBeCalledTimes(1);
  });

  test("should select account properly", async () => {
    const { findByTestId } = render(<AccountMenu {...defaulltProps} />);

    const [cryptKeeperAccount] = defaultHookData.accounts;
    const account = await findByTestId(`${cryptKeeperAccount.type}-${cryptKeeperAccount.address}`);
    await act(async () => Promise.resolve(account.click()));

    expect(defaultHookData.onSelectAccount).toBeCalledTimes(1);
    expect(defaultHookData.onSelectAccount).toBeCalledWith(cryptKeeperAccount.address);
  });
});
