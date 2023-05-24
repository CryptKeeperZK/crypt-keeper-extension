/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { useEthWallet } from "@src/ui/hooks/wallet";

import Home from "..";
import { IUseHomeData, useHome } from "../useHome";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("../useHome", (): unknown => ({
  useHome: jest.fn(),
}));

describe("ui/pages/Home", () => {
  const mockNavigate = jest.fn();

  const defaultHookData: IUseHomeData = {
    identities: [],
    address: defaultWalletHookData.address,
    balance: defaultWalletHookData.balance,
    chain: defaultWalletHookData.chain,
    refreshConnectionStatus: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    (useHome as jest.Mock).mockReturnValue(defaultHookData);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useEthWallet as jest.Mock).mockReturnValue(defaultWalletHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <Home />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("home-page");

    expect(page).toBeInTheDocument();
  });
});
