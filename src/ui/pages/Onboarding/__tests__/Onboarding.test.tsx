/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act } from "@testing-library/react";

import { setupPassword } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import Onboarding from "..";

jest.mock("@src/ui/ducks/app", (): unknown => ({
  setupPassword: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/Onboarding", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (setupPassword as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    render(<Onboarding />);

    const form = await screen.findByTestId("onboarding-form");

    expect(form).toBeInTheDocument();
  });

  test("should handle error properly", async () => {
    const err = new Error("Error");
    (mockDispatch as jest.Mock).mockRejectedValue(err);
    render(<Onboarding />);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "password" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () => Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "password" } })));

    const button = await screen.findByTestId("submit-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText(err.message);
    expect(error).toBeInTheDocument();
  });

  test("should render unmatch passwords error properly", async () => {
    render(<Onboarding />);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "password1" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () => Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "password2" } })));

    const button = await screen.findByTestId("submit-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText("Passwords must match");
    expect(error).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    render(<Onboarding />);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "password" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () => Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "password" } })));

    const button = await screen.findByTestId("submit-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(mockDispatch).toBeCalledTimes(1);
    expect(setupPassword).toBeCalledTimes(1);
    expect(setupPassword).toBeCalledWith("password");
  });
});
