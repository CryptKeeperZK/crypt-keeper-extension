/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";

import { fetchStatus, unlock, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchPendingRequests, usePendingRequests } from "@src/ui/ducks/requests";

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

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  fetchPendingRequests: jest.fn(),
  usePendingRequests: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
  fetchStatus: jest.fn(),
  unlock: jest.fn(),
  useAppStatus: jest.fn(),
}));

describe("ui/pages/Login", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockDispatch.mockResolvedValue(undefined);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useAppStatus as jest.Mock).mockReturnValue({ isUnlocked: false });

    (usePendingRequests as jest.Mock).mockReturnValue([]);

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

    expect(mockDispatch).toBeCalledTimes(3);
    expect(unlock).toBeCalledTimes(1);
    expect(unlock).toBeCalledWith("password");
    expect(fetchStatus).toBeCalledTimes(1);
    expect(fetchPendingRequests).toBeCalledTimes(1);
  });
});
