/**
 * @jest-environment jsdom
 */

import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import selectEvent from "react-select-event";

import { ZERO_ADDRESS } from "@src/config/const";
import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { EWallet } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useEthWallet } from "@src/ui/hooks/wallet";
import { signWithSigner, getMessageTemplate } from "@src/ui/services/identity";

import CreateIdentity from "..";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/services/identity", (): unknown => ({
  signWithSigner: jest.fn(),
  getMessageTemplate: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  createIdentity: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
}));

describe("ui/pages/CreateIdentity", () => {
  const mockSignedMessage = "signed-message";
  const mockMessage = "message";
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  beforeEach(() => {
    library.add(faTwitter, faGithub, faReddit);

    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (signWithSigner as jest.Mock).mockResolvedValue(mockSignedMessage);

    (getMessageTemplate as jest.Mock).mockReturnValue(mockMessage);

    (createIdentity as jest.Mock).mockResolvedValue(true);

    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render properly with random", async () => {
    const { container } = render(<CreateIdentity />);

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const metamaskButton = await screen.findByText("Metamask");
    const cryptkeeperButton = await screen.findByText("Cryptkeeper");
    const identityType = await screen.findByText("Random");

    expect(metamaskButton).toBeInTheDocument();
    expect(cryptkeeperButton).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should render properly without metamask installed", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isInjectedWallet: false });

    const { container } = render(<CreateIdentity />);

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const metamaskButton = await screen.findByText("Install Metamask");
    const cryptkeeperButton = await screen.findByText("Cryptkeeper");
    const identityType = await screen.findByText("Random");

    expect(metamaskButton).toBeInTheDocument();
    expect(cryptkeeperButton).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should connect properly to eth wallet", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: false });

    const { container } = render(<CreateIdentity />);

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const metamaskButton = await screen.findByText("Connect to Metamask");

    await act(async () => Promise.resolve(fireEvent.click(metamaskButton)));

    expect(defaultWalletHookData.onConnect).toBeCalledTimes(1);
  });

  test("should create random identity properly", async () => {
    const { container } = render(<CreateIdentity />);

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const button = await screen.findByText("Cryptkeeper");
    await act(async () => Promise.resolve(fireEvent.click(button)));

    expect(signWithSigner).toBeCalledTimes(0);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      messageSignature: undefined,
      options: { message: mockMessage, account: ZERO_ADDRESS },
      strategy: "random",
      walletType: EWallet.CRYPT_KEEPER_WALLET,
    });
  });

  test("should render properly with interrep provider", async () => {
    const { container } = render(<CreateIdentity />);

    await waitFor(() => container.firstChild !== null);

    const metamaskButton = await screen.findByText("Metamask");
    const cryptkeeperButton = await screen.findByText("Cryptkeeper");
    const provider = await screen.findByText("Twitter");
    const identityType = await screen.findByText("InterRep");

    expect(metamaskButton).toBeInTheDocument();
    expect(cryptkeeperButton).toBeInTheDocument();
    expect(provider).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should create interrep github identity properly", async () => {
    const { container } = render(<CreateIdentity />);

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Web2 Provider");
    await selectEvent.select(select, WEB2_PROVIDER_OPTIONS[2].label);

    const nonce = await screen.findByLabelText("Nonce");
    await act(async () => Promise.resolve(fireEvent.change(nonce, { target: { value: 1 } })));

    const button = await screen.findByText("Metamask");
    await act(async () => Promise.resolve(fireEvent.click(button)));

    expect(signWithSigner).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      strategy: "interrep",
      messageSignature: mockSignedMessage,
      walletType: EWallet.ETH_WALLET,
      options: {
        account: ZERO_ADDRESS,
        message: mockMessage,
        nonce: "1",
        web2Provider: "github",
      },
    });
  });

  test("should handle error properly", async () => {
    const err = new Error("Error");
    (signWithSigner as jest.Mock).mockRejectedValue(err);
    const { container } = render(<CreateIdentity />);

    await waitFor(() => container.firstChild !== null);

    const button = await screen.findByText("Metamask");
    await act(async () => Promise.resolve(fireEvent.click(button)));

    const error = await screen.findByText(err.message);
    expect(error).toBeInTheDocument();
  });
});
