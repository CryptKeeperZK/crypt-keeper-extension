/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act } from "@testing-library/react";

import { Onboarding } from "..";
import { IUseOnboardingData, useOnboarding } from "../useOnboarding";

jest.mock("../useOnboarding", (): unknown => ({
  useOnboarding: jest.fn(),
}));

describe("ui/pages/Onboarding", () => {
  const defaultHookData: IUseOnboardingData = {
    isValid: false,
    password: "",
    confirmPassword: "",
    error: "",
    isLoading: false,
    onChangePassword: jest.fn(),
    onChangeConfirmPassword: jest.fn(),
    onSubmit: jest.fn((event) => event.preventDefault()),
  };

  beforeEach(() => {
    (useOnboarding as jest.Mock).mockReturnValue(defaultHookData);
  });

  test("should render properly", async () => {
    render(<Onboarding />);

    const form = await screen.findByTestId("onboarding-form");

    expect(form).toBeInTheDocument();
  });

  test("should render properly with error", async () => {
    (useOnboarding as jest.Mock).mockReturnValue({ ...defaultHookData, error: "Error" });
    render(<Onboarding />);

    const error = await screen.findByText("Error");

    expect(error).toBeInTheDocument();
  });

  test("should input password properly", async () => {
    render(<Onboarding />);

    const passwordInput = await screen.findByLabelText("Password");
    act(() => fireEvent.change(passwordInput, { target: { value: "password" } }));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    act(() => fireEvent.change(confirmPasswordInput, { target: { value: "password" } }));

    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(defaultHookData.onChangePassword).toBeCalledTimes(1);
    expect(defaultHookData.onChangeConfirmPassword).toBeCalledTimes(1);
  });

  test("should submit form properly", async () => {
    (useOnboarding as jest.Mock).mockReturnValue({
      ...defaultHookData,
      isValid: true,
      password: "password",
      confirmPassword: "password",
    });
    render(<Onboarding />);

    const button = await screen.findByTestId("submit-button");
    act(() => button.click());

    expect(defaultHookData.onSubmit).toBeCalledTimes(1);
  });
});
