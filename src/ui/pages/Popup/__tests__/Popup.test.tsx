/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter } from "react-router-dom";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { useAppDispatch, useAppSelector } from "@src/ui/ducks/hooks";
import { usePendingRequests } from "@src/ui/ducks/requests";
import { useWallet } from "@src/ui/hooks/wallet";

import Popup from "..";
import { IUsePopupData, usePopup } from "../usePopup";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  usePendingRequests: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

jest.mock("../usePopup", (): unknown => ({
  usePopup: jest.fn(),
}));

describe("ui/pages/Popup", () => {
  const defaultHookData: IUsePopupData = {
    isLoading: false,
  };

  beforeEach(() => {
    (usePopup as jest.Mock).mockReturnValue(defaultHookData);

    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (usePendingRequests as jest.Mock).mockReturnValue([{ type: "unknown" }]);

    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());

    (useAppSelector as jest.Mock).mockReturnValue([]);

    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render onboarding page properly", async () => {
    const { container, findByTestId } = render(
      <MemoryRouter initialEntries={[Paths.ONBOARDING]}>
        <Suspense>
          <Popup />
        </Suspense>
      </MemoryRouter>,
    );

    await waitFor(() => container.firstChild !== null);

    const onboarding = await findByTestId("onboarding-form");

    expect(onboarding).toBeInTheDocument();
  });

  test("should render login page properly", async () => {
    const { container, findByTestId } = render(
      <MemoryRouter initialEntries={[Paths.LOGIN]}>
        <Suspense>
          <Popup />
        </Suspense>
      </MemoryRouter>,
    );

    await waitFor(() => container.firstChild !== null);

    const login = await findByTestId("login-form");

    expect(login).toBeInTheDocument();
  });

  test("should not render if it's loading", () => {
    (usePopup as jest.Mock).mockReturnValue({ ...defaultHookData, isLoading: true });

    const { container } = render(
      <MemoryRouter>
        <Suspense>
          <Popup />
        </Suspense>
      </MemoryRouter>,
    );

    expect(container.children).toHaveLength(0);
  });

  test("should render pending requests modal properly", async () => {
    const { container, findByTestId } = render(
      <MemoryRouter initialEntries={[Paths.REQUESTS]}>
        <Suspense>
          <Popup />
        </Suspense>
      </MemoryRouter>,
    );

    await waitFor(() => container.firstChild !== null);

    const modal = await findByTestId("default-approval-modal");

    expect(modal).toBeInTheDocument();
  });

  test("should render home page properly", async () => {
    const { container, findByTestId } = render(
      <MemoryRouter initialEntries={[Paths.HOME]}>
        <Suspense>
          <Popup />
        </Suspense>
      </MemoryRouter>,
    );

    await waitFor(() => container.firstChild !== null);

    const home = await findByTestId("home-page");
    expect(home).toBeInTheDocument();
  });
});
