/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import { Popup } from "..";
import { IUsePopupData, usePopup } from "../usePopup";

jest.mock("@src/ui/pages/Home", (): unknown => ({
  Home: () => <div data-testid="home-page" />,
}));

jest.mock("@src/ui/components/ConfirmRequestModal", (): unknown => ({
  ConfirmRequestModal: () => <div data-testid="default-approval-modal" />,
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("../usePopup", (): unknown => ({
  usePopup: jest.fn(),
}));

describe("ui/pages/Popup", () => {
  const defaultHoodData: IUsePopupData = {
    isLoading: false,
    isInitialized: false,
    isUnlocked: false,
    pendingRequests: [],
  };

  beforeEach(() => {
    (usePopup as jest.Mock).mockReturnValue(defaultHoodData);

    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
  });

  test("should render onboarding form properly", async () => {
    render(
      <MemoryRouter>
        <Popup />
      </MemoryRouter>,
    );

    const onboarding = await screen.findByTestId("onboarding-form");

    expect(onboarding).toBeInTheDocument();
  });

  test("should not render if it's loading", () => {
    (usePopup as jest.Mock).mockReturnValue({ ...defaultHoodData, isLoading: true });
    const { container } = render(
      <MemoryRouter>
        <Popup />
      </MemoryRouter>,
    );

    expect(container.children).toHaveLength(0);
  });

  test("should render login form properly", async () => {
    (usePopup as jest.Mock).mockReturnValue({ ...defaultHoodData, isInitialized: true });
    render(
      <MemoryRouter>
        <Popup />
      </MemoryRouter>,
    );

    const login = await screen.findByTestId("login-form");

    expect(login).toBeInTheDocument();
  });

  test("should render home properly", async () => {
    (usePopup as jest.Mock).mockReturnValue({ ...defaultHoodData, isInitialized: true, isUnlocked: true });
    render(
      <MemoryRouter>
        <Popup />
      </MemoryRouter>,
    );

    const page = await screen.findByTestId("home-page");

    expect(page).toBeInTheDocument();
  });

  test("should render pending requests modal properly", async () => {
    (usePopup as jest.Mock).mockReturnValue({
      ...defaultHoodData,
      isInitialized: true,
      isUnlocked: true,
      pendingRequests: [{}],
    });

    render(
      <MemoryRouter>
        <Popup />
      </MemoryRouter>,
    );

    const modal = await screen.findByTestId("default-approval-modal");

    expect(modal).toBeInTheDocument();
  });
});
