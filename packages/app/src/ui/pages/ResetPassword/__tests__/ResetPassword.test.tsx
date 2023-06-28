/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";

import ResetPassword from "..";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("ui/pages/ResetPassword", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container } = render(<ResetPassword />);

    await waitFor(() => container.firstChild !== null);

    const page = await screen.findByTestId("reset-password-page");

    expect(page).toBeInTheDocument();
  });

  test("should render unmatch passwords error properly", async () => {
    const { container } = render(<ResetPassword />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "Password123@" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () =>
      Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "Password123@4" } })),
    );

    const button = await screen.findByTestId("submit-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText("Passwords must match");
    expect(error).toBeInTheDocument();
  });

  test("should render weak password error properly", async () => {
    const { container } = render(<ResetPassword />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "12345" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () => Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "12345" } })));

    const button = await screen.findByTestId("submit-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText("Password isn't strong");
    expect(error).toBeInTheDocument();
  });

  test("should be able to show/hide password", async () => {
    const { container } = render(<ResetPassword />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "12345" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () => Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "12345" } })));

    const showButton = await screen.findByText("Show");

    expect(showButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(showButton)));

    const hideButton = await screen.findByText("Hide");

    expect(hideButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(hideButton)));

    expect(showButton).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    const { container } = render(<ResetPassword />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "Password123@" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () =>
      Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "Password123@" } })),
    );

    const button = await screen.findByTestId("submit-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });
});
