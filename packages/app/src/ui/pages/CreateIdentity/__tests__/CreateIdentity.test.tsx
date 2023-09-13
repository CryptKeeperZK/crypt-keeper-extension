/**
 * @jest-environment jsdom
 */

import { EWallet } from "@cryptkeeperzk/types";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import selectEvent from "react-select-event";

import { ZERO_ADDRESS } from "@src/config/const";
import { getEnabledFeatures } from "@src/config/features";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IDENTITY_TYPES, Paths, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
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
  useCryptKeeperWallet: jest.fn(),
}));

describe("ui/pages/CreateIdentity", () => {
  const mockSignedMessage = "signed-message";
  const mockMessage = "message";
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  const oldHref = window.location.href;

  Object.defineProperty(window, "location", {
    value: {
      href: oldHref,
    },
    writable: true,
  });

  beforeEach(() => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (useCryptKeeperWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (signWithSigner as jest.Mock).mockResolvedValue(mockSignedMessage);

    (getMessageTemplate as jest.Mock).mockReturnValue(mockMessage);

    (createIdentity as jest.Mock).mockResolvedValue(true);

    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTEREP_IDENTITY: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.location.href = oldHref;
  });

  test("should render properly with random", async () => {
    const { container } = render(
      <Suspense>
        <CreateIdentity />
      </Suspense>,
    );

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

    const { container } = render(
      <Suspense>
        <CreateIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const metamaskButton = await screen.findByText("Install MetaMask");
    const cryptkeeperButton = await screen.findByText("Cryptkeeper");
    const identityType = await screen.findByText("Random");

    expect(metamaskButton).toBeInTheDocument();
    expect(cryptkeeperButton).toBeInTheDocument();
    expect(identityType).toBeInTheDocument();
  });

  test("should connect properly to eth wallet", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: false });

    const { container } = render(
      <Suspense>
        <CreateIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const metamaskButton = await screen.findByText("Connect to Metamask");

    await act(async () => Promise.resolve(fireEvent.click(metamaskButton)));

    expect(defaultWalletHookData.onConnect).toBeCalledTimes(1);
  });

  test("should create random identity properly", async () => {
    const { container } = render(
      <Suspense>
        <CreateIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Identity type");
    await selectEvent.select(select, IDENTITY_TYPES[1].label);

    const button = await screen.findByText("Cryptkeeper");
    await act(async () => Promise.resolve(fireEvent.click(button)));

    expect(signWithSigner).toBeCalledTimes(0);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
    expect(closePopup).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      groups: [],
      messageSignature: undefined,
      options: { message: mockMessage, account: ZERO_ADDRESS },
      strategy: "random",
      walletType: EWallet.CRYPTKEEPER_WALLET,
    });
  });

  test("should create random identity with disabled interep identity feature properly", async () => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTEREP_IDENTITY: false });

    const { container } = render(
      <Suspense>
        <CreateIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await screen.findByText("Cryptkeeper");
    await act(async () => Promise.resolve(fireEvent.click(button)));

    expect(signWithSigner).toBeCalledTimes(0);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
    expect(closePopup).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      groups: [],
      messageSignature: undefined,
      options: { message: mockMessage, account: ZERO_ADDRESS },
      strategy: "random",
      walletType: EWallet.CRYPTKEEPER_WALLET,
    });
  });

  test("should render properly with interep provider", async () => {
    const { container } = render(
      <Suspense>
        <CreateIdentity />
      </Suspense>,
    );

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

  test("should create interep github identity properly", async () => {
    const { container } = render(
      <Suspense>
        <CreateIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const select = await screen.findByLabelText("Web2 Provider");
    await selectEvent.select(select, WEB2_PROVIDER_OPTIONS[2].label);

    const nonce = await screen.findByLabelText("Nonce");
    await act(async () => Promise.resolve(fireEvent.change(nonce, { target: { value: 1 } })));

    const button = await screen.findByText("Metamask");
    await act(async () => Promise.resolve(fireEvent.click(button)));

    expect(signWithSigner).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
    expect(closePopup).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      strategy: "interep",
      messageSignature: mockSignedMessage,
      walletType: EWallet.ETH_WALLET,
      groups: [],
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
    const { container } = render(
      <Suspense>
        <CreateIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await screen.findByText("Metamask");
    await act(async () => Promise.resolve(fireEvent.click(button)));

    const error = await screen.findByText(err.message);
    expect(error).toBeInTheDocument();
  });
});
