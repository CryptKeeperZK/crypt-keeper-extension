/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";

import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";

import { CreateIdentityModal, ICreateIdentityModalProps } from "..";
import { IUseCreateIdentityModalData, useCreateIdentityModal } from "../useCreateIdentityModal";

jest.mock("../useCreateIdentityModal", (): unknown => ({
  useCreateIdentityModal: jest.fn(),
}));

describe("ui/components/CreateIdentityModal", () => {
  const defaultProps: ICreateIdentityModalProps = {
    len: 1,
    accept: jest.fn(),
    reject: jest.fn(),
  };

  const defaultHookData: IUseCreateIdentityModalData = {
    isLoading: false,
    nonce: 0,
    error: "",
    identityStrategyType: IDENTITY_TYPES[1],
    web2Provider: WEB2_PROVIDER_OPTIONS[0],
    closeModal: jest.fn(),
    onSelectIdentityType: jest.fn(),
    onSelectWeb2Provider: jest.fn(),
    onChangeNonce: jest.fn(),
    onCreateIdentity: jest.fn(),
  };

  beforeEach(() => {
    (useCreateIdentityModal as jest.Mock).mockReturnValue(defaultHookData);

    const container = document.createElement("div");
    container.id = "modal";
    document.body.append(container);
  });

  afterEach(() => {
    jest.resetAllMocks();

    const container = document.getElementById("modal");
    document.body.removeChild(container as HTMLElement);
  });

  test("should render properly", async () => {
    render(<CreateIdentityModal {...defaultProps} len={2} />);

    const button = await screen.findByText("Create");
    const identityType = await screen.findByText("Random");

    expect(button).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should render properly with interrep provider and error", async () => {
    (useCreateIdentityModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      error: "error",
      identityStrategyType: IDENTITY_TYPES[0],
      web2Provider: WEB2_PROVIDER_OPTIONS[2],
    });

    render(<CreateIdentityModal {...defaultProps} />);

    const button = await screen.findByText("Create");
    const provider = await screen.findByText("Github");
    const identityType = await screen.findByText("InterRep");
    const error = await screen.findByText("error");

    expect(button).toBeInTheDocument();
    expect(error).toBeInTheDocument();
    expect(provider).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should create identity properly", async () => {
    render(<CreateIdentityModal {...defaultProps} />);

    const button = await screen.findByText("Create");
    act(() => button.click());

    expect(defaultHookData.onCreateIdentity).toBeCalledTimes(1);
  });
});
