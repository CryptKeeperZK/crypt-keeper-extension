/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";

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
    const { container } = render(<Onboarding />);

    await waitFor(() => container.firstChild !== null);

    const form = await screen.findByTestId("onboarding-form");

    expect(form).toBeInTheDocument();
  });

  test("should handle error properly", async () => {
    const err = new Error("Error");
    (mockDispatch as jest.Mock).mockRejectedValue(err);
    const { container } = render(<Onboarding />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "Password123@" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () =>
      Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "Password123@" } })),
    );

    const button = await screen.findByTestId("submit-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText(err.message);
    expect(error).toBeInTheDocument();
  });

  test("should render unmatch passwords error properly", async () => {
    const { container } = render(<Onboarding />);

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
    const { container } = render(<Onboarding />);

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
    const { container } = render(<Onboarding />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "12345" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () => Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "12345" } })));

    const eyeLookButton = await screen.findByTestId("eye-look-button");

    expect(eyeLookButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(eyeLookButton)));

    const eyeSlashButton = await screen.findByTestId("eye-slash-button");

    expect(eyeSlashButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(eyeSlashButton)));

    expect(eyeLookButton).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    const { container } = render(<Onboarding />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "Password123@" } })));

    const confirmPasswordInput = await screen.findByLabelText("Confirm Password");
    await act(async () =>
      Promise.resolve(fireEvent.change(confirmPasswordInput, { target: { value: "Password123@" } })),
    );

    const button = await screen.findByTestId("submit-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(mockDispatch).toBeCalledTimes(1);
    expect(setupPassword).toBeCalledTimes(1);
    expect(setupPassword).toBeCalledWith("Password123@");
  });
});
