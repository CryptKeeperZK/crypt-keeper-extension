/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act } from "@testing-library/react";

import { Login } from "..";
import { IUseLoginData, useLogin } from "../useLogin";

jest.mock("../useLogin", (): unknown => ({
  useLogin: jest.fn(),
}));

describe("ui/pages/Login", () => {
  const defaultHookData: IUseLoginData = {
    password: "",
    error: "",
    isLoading: false,
    onChangePassword: jest.fn(),
    onSubmit: jest.fn((event) => event.preventDefault()),
  };

  beforeEach(() => {
    (useLogin as jest.Mock).mockReturnValue(defaultHookData);
  });

  test("should render properly", async () => {
    render(<Login />);

    const form = await screen.findByTestId("login-form");

    expect(form).toBeInTheDocument();
  });

  test("should render properly with error", async () => {
    (useLogin as jest.Mock).mockReturnValue({ ...defaultHookData, error: "Error" });
    render(<Login />);

    const error = await screen.findByText("Error");

    expect(error).toBeInTheDocument();
  });

  test("should input password properly", async () => {
    render(<Login />);

    const input = await screen.findByLabelText("Password");
    act(() => fireEvent.change(input, { target: { value: "password" } }));

    expect(input).toBeInTheDocument();
    expect(defaultHookData.onChangePassword).toBeCalledTimes(1);
  });

  test("should submit form properly", async () => {
    (useLogin as jest.Mock).mockReturnValue({ ...defaultHookData, password: "password" });
    render(<Login />);

    const button = await screen.findByTestId("unlock-button");
    act(() => button.click());

    expect(defaultHookData.onSubmit).toBeCalledTimes(1);
  });
});
