/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";

import { IUseCreateIdentityModalData, useCreateIdentityModal } from "../useCreateIdentityModal";
import { CreateIdentityModal, ICreateIdentityModalProps } from "..";

jest.mock("../useCreateIdentityModal", (): unknown => ({
  useCreateIdentityModal: jest.fn(),
}));

describe("ui/components/CreateIdentityModal", () => {
  const defaultProps: ICreateIdentityModalProps = {
    onClose: jest.fn(),
  };

  const defaultHookData: IUseCreateIdentityModalData = {
    isLoading: false,
    nonce: 0,
    error: "",
    identityStrategyType: "random",
    web2Provider: "twitter",
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
    render(<CreateIdentityModal {...defaultProps} />);

    const button = await screen.findByText("Create");
    const identityType = await screen.findByText("random");

    expect(button).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should render properly with interrep provider and error", async () => {
    (useCreateIdentityModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      error: "error",
      identityStrategyType: "interrep",
      web2Provider: "github",
    });

    render(<CreateIdentityModal {...defaultProps} />);

    const button = await screen.findByText("Create");
    const provider = await screen.findByText("github");
    const identityType = await screen.findByText("interrep");
    const error = await screen.findByText("error");

    expect(button).toBeInTheDocument();
    expect(error).toBeInTheDocument();
    expect(provider).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });
});
