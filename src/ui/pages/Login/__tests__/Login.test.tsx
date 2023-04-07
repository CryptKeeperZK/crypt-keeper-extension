/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";

import { unlock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import Login from "..";

jest.mock("@src/ui/ducks/app", (): unknown => ({
  unlock: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/Login", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (unlock as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container } = render(<Login />);

    await waitFor(() => container.firstChild !== null);

    const form = await screen.findByTestId("login-form");

    expect(form).toBeInTheDocument();
  });

  test("should handle error properly", async () => {
    const err = new Error("Error");
    (mockDispatch as jest.Mock).mockRejectedValue(err);
    const { container } = render(<Login />);

    await waitFor(() => container.firstChild !== null);

    const input = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(input, { target: { value: "password" } })));

    const button = await screen.findByTestId("unlock-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText(err.message);
    expect(error).toBeInTheDocument();
  });

  test("should be able to show/hide password", async () => {
    const { container } = render(<Login />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "12345" } })));

    const eyeLookButton = await screen.findByTestId("eye-look-button");

    expect(eyeLookButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(eyeLookButton)));

    const eyeSlashButton = await screen.findByTestId("eye-slash-button");

    expect(eyeSlashButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(eyeSlashButton)));

    expect(eyeLookButton).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    const { container } = render(<Login />);

    await waitFor(() => container.firstChild !== null);

    const input = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(input, { target: { value: "password" } })));

    const button = await screen.findByTestId("unlock-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(mockDispatch).toBeCalledTimes(1);
    expect(unlock).toBeCalledTimes(1);
    expect(unlock).toBeCalledWith("password");
  });
});
