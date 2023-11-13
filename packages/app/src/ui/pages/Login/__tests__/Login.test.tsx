/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup, unlock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import Login from "..";

jest.mock("react-router-dom", (): unknown => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  unlock: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
  unlock: jest.fn(),
}));

describe("ui/pages/Login", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockDispatch.mockResolvedValue(undefined);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (unlock as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container } = render(
      <Suspense>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const form = await screen.findByTestId("login-form");

    expect(form).toBeInTheDocument();
  });

  test("should handle error properly", async () => {
    const err = new Error("Error");
    (mockDispatch as jest.Mock).mockRejectedValueOnce(err);
    const { container } = render(
      <Suspense>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const input = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(input, { target: { value: "password" } })));

    const button = await screen.findByTestId("unlock-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText(err.message);
    expect(error).toBeInTheDocument();
  });

  test("should show/hide password", async () => {
    const { container } = render(
      <Suspense>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "12345" } })));

    const showButton = await screen.findByText("Show");

    expect(showButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(showButton)));

    const hideButton = await screen.findByText("Hide");

    expect(hideButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(hideButton)));

    expect(showButton).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    const { container } = render(
      <Suspense>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const input = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(input, { target: { value: "password" } })));

    const button = await screen.findByTestId("unlock-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(unlock).toHaveBeenCalledTimes(1);
    expect(unlock).toHaveBeenCalledWith("password");
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });
});
