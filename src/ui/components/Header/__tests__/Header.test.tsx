/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { useWallet } from "@src/ui/hooks/wallet";

import { Header } from "..";

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

describe("ui/components/Header", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    (useWallet as jest.Mock).mockReturnValue({
      ...defaultWalletHookData,
      isActive: true,
    });

    const { findByText } = render(<Header />);

    const chain = await findByText(defaultWalletHookData.chain?.name as string);

    expect(chain).toBeInTheDocument();
  });

  test("should render properly without connected wallet", async () => {
    (useWallet as jest.Mock).mockReturnValue({
      ...defaultWalletHookData,
      address: undefined,
      chain: undefined,
      isActive: false,
      isActivating: false,
    });

    const { findByTestId } = render(<Header />);

    const icon = await findByTestId("inactive-wallet-icon");

    expect(icon).toBeInTheDocument();
  });

  test("should render properly activating state", async () => {
    (useWallet as jest.Mock).mockReturnValue({
      ...defaultWalletHookData,
      address: undefined,
      chain: undefined,
      isActive: false,
      isActivating: true,
    });

    const { findByTestId } = render(<Header />);

    const icon = await findByTestId("inactive-wallet-icon-activating");

    expect(icon).toBeInTheDocument();
  });
});
