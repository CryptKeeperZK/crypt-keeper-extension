/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import selectEvent from "react-select-event";

import { ZERO_ADDRESS } from "@src/config/const";
import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";
import { signIdentityMessage } from "@src/ui/services/identity";

import CreateIdentity from "..";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/services/identity", (): unknown => ({
  signIdentityMessage: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  createIdentity: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

describe("ui/pages/CreateIdentity", () => {
  const mockSignedMessage = "signed-message";
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (signIdentityMessage as jest.Mock).mockResolvedValue(mockSignedMessage);

    (createIdentity as jest.Mock).mockResolvedValue(true);

    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render properly with random", async () => {
    render(<CreateIdentity />);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const button = await screen.findByText("Create");
    const identityType = await screen.findByText("Random");

    expect(button).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should create random identity properly", async () => {
    render(<CreateIdentity />);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const button = await screen.findByText("Create");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(signIdentityMessage).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith("random", mockSignedMessage, {});
  });

  test("should render properly with interrep provider", async () => {
    render(<CreateIdentity />);

    const button = await screen.findByText("Create");
    const provider = await screen.findByText("Twitter");
    const identityType = await screen.findByText("InterRep");

    expect(button).toBeInTheDocument();
    expect(provider).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should create interrep github identity properly", async () => {
    render(<CreateIdentity />);

    const select = await screen.findByLabelText("Web2 Provider");
    await selectEvent.select(select, WEB2_PROVIDER_OPTIONS[2].label);

    const nonce = await screen.findByLabelText("Nonce");
    await act(async () => Promise.resolve(fireEvent.change(nonce, { target: { value: 1 } })));

    const button = await screen.findByText("Create");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(signIdentityMessage).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith("interrep", mockSignedMessage, {
      account: ZERO_ADDRESS,
      nonce: "1",
      web2Provider: "github",
    });
  });

  test("should handle error properly", async () => {
    const err = new Error("Error");
    (signIdentityMessage as jest.Mock).mockRejectedValue(err);
    render(<CreateIdentity />);

    const button = await screen.findByText("Create");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText(err.message);
    expect(error).toBeInTheDocument();
  });
});
