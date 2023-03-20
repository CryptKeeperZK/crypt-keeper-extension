/**
 * @jest-environment jsdom
 */

import { act, render, screen, fireEvent } from "@testing-library/react";

import { ZERO_ADDRESS } from "@src/config/const";
import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IdentityMetadata } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  deleteIdentity,
  IdentityData,
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
  createIdentityRequest: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

describe("ui/pages/Home/components/IdentityList", () => {
  const mockDispatch = jest.fn();

  const defaultIdentities: IdentityData[] = [
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

    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render properly", async () => {
    render(<IdentityList identities={defaultIdentities} />);

    const identityName1 = await screen.findByText(defaultIdentities[0].metadata.name);
    const identityName2 = await screen.findByText(defaultIdentities[1].metadata.name);

    expect(identityName1).toBeInTheDocument();
    expect(identityName2).toBeInTheDocument();
  });

  test("should render properly without connected wallet", async () => {
    (useWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, address: undefined });

    render(<IdentityList identities={defaultIdentities} />);

    const identityName1 = await screen.findByText(defaultIdentities[0].metadata.name);
    const identityName2 = await screen.findByText(defaultIdentities[1].metadata.name);

    expect(identityName1).toBeInTheDocument();
    expect(identityName2).toBeInTheDocument();
  });

  test("should select identity properly", async () => {
    render(<IdentityList identities={defaultIdentities} />);

    const selectIcon = await screen.findByTestId(`identity-select-${defaultIdentities[1].commitment}`);
    act(() => selectIcon.click());

    expect(setActiveIdentity).toBeCalledTimes(1);
    expect(setActiveIdentity).toBeCalledWith(defaultIdentities[1].commitment);
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should rename identity properly", async () => {
    render(<IdentityList identities={defaultIdentities} />);

    const [menuIcon] = await screen.findAllByTestId("menu");
    act(() => menuIcon.click());

    const renameButton = await screen.findByText("Rename");
    act(() => renameButton.click());

    const input = await screen.findByDisplayValue(defaultIdentities[0].metadata.name);
    fireEvent.change(input, { target: { value: "New name" } });

    const renameIcon = await screen.findByTestId(`identity-rename-${defaultIdentities[0].commitment}`);
    await act(async () => Promise.resolve(renameIcon.click()));

    expect(setIdentityName).toBeCalledTimes(1);
    expect(setIdentityName).toBeCalledWith(defaultIdentities[0].commitment, "New name");
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should delete identity properly", async () => {
    render(<IdentityList identities={defaultIdentities} />);

    const [menuIcon] = await screen.findAllByTestId("menu");
    act(() => menuIcon.click());

    const deleteButton = await screen.findByText("Delete");
    act(() => deleteButton.click());

    expect(deleteIdentity).toBeCalledTimes(1);
    expect(deleteIdentity).toBeCalledWith(defaultIdentities[0].commitment);
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should open create identity modal properly", async () => {
    render(<IdentityList identities={defaultIdentities} />);

    const createIdentityButton = await screen.findByTestId("create-new-identity");
    await act(async () => Promise.resolve(createIdentityButton.click()));

    expect(mockDispatch).toBeCalledTimes(1);
  });
});
