/**
 * @jest-environment jsdom
 */

import { act, render, screen, fireEvent } from "@testing-library/react";

import { ZERO_ADDRESS } from "@src/config/const";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IdentityMetadata } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  deleteIdentity,
  setActiveIdentity,
  setIdentityName,
  useIdentities,
  useSelectedIdentity,
} from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";

import { IdentityList } from "..";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  deleteIdentity: jest.fn(),
  setActiveIdentity: jest.fn(),
  setIdentityName: jest.fn(),
  useIdentities: jest.fn(),
  useSelectedIdentity: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

describe("ui/pages/Home/components/IdentityList", () => {
  const mockDispatch = jest.fn();

  const defaultIdentities: { commitment: string; metadata: IdentityMetadata }[] = [
    {
      commitment: "0",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #0",
        identityStrategy: "interrep",
        web2Provider: "twitter",
      },
    },
    {
      commitment: "1",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #1",
        identityStrategy: "random",
      },
    },
  ];

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useIdentities as jest.Mock).mockReturnValue(defaultIdentities);

    (useSelectedIdentity as jest.Mock).mockReturnValue(defaultIdentities[0]);

    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

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
    render(<IdentityList />);

    const identityName1 = await screen.findByText(defaultIdentities[0].metadata.name);
    const identityName2 = await screen.findByText(defaultIdentities[1].metadata.name);

    expect(identityName1).toBeInTheDocument();
    expect(identityName2).toBeInTheDocument();
  });

  test("should render properly without connected wallet", async () => {
    (useWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, address: undefined });

    render(<IdentityList />);

    const identityName1 = await screen.findByText(defaultIdentities[0].metadata.name);
    const identityName2 = await screen.findByText(defaultIdentities[1].metadata.name);

    expect(identityName1).toBeInTheDocument();
    expect(identityName2).toBeInTheDocument();
  });

  test("should select identity properly", async () => {
    render(<IdentityList />);

    const selectIcon = await screen.findByTestId(`identity-select-${defaultIdentities[1].commitment}`);
    act(() => selectIcon.click());

    expect(setActiveIdentity).toBeCalledTimes(1);
    expect(setActiveIdentity).toBeCalledWith(defaultIdentities[1].commitment);
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should rename identity properly", async () => {
    render(<IdentityList />);

    const [menuIcon] = await screen.findAllByTestId("menu");
    act(() => menuIcon.click());

    const renameButton = await screen.findByText("Rename");
    act(() => renameButton.click());

    const input = await screen.findByDisplayValue(defaultIdentities[0].metadata.name);
    fireEvent.change(input, { target: { value: "New name" } });

    const renameIcon = await screen.findByTestId(`identity-rename-${defaultIdentities[0].commitment}`);
    await act(async () => renameIcon.click());

    expect(setIdentityName).toBeCalledTimes(1);
    expect(setIdentityName).toBeCalledWith(defaultIdentities[0].commitment, "New name");
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should delete identity properly", async () => {
    render(<IdentityList />);

    const [menuIcon] = await screen.findAllByTestId("menu");
    act(() => menuIcon.click());

    const deleteButton = await screen.findByText("Delete");
    act(() => deleteButton.click());

    expect(deleteIdentity).toBeCalledTimes(1);
    expect(deleteIdentity).toBeCalledWith(defaultIdentities[0].commitment);
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should open create identity modal properly", async () => {
    render(<IdentityList />);

    const createIdentityButton = await screen.findByTestId("create-new-identity");
    await act(async () => createIdentityButton.click());

    const modal = await screen.findByTestId("create-identity-modal");
    expect(modal).toBeInTheDocument();

    const closeIcon = await screen.findByTestId("close-icon");
    await act(async () => closeIcon.click());

    expect(screen.queryByTestId("create-identity-modal")).not.toBeInTheDocument();
  });
});
