/**
 * @jest-environment jsdom
 */

import { IIdentityData } from "@cryptkeeperzk/types";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { Paths } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteIdentity, setIdentityName, useIdentities } from "@src/ui/ducks/identities";
import { isExtensionPopupOpen } from "@src/util/browser";

import { IdentityList, IIdentityListProps } from "..";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  deleteIdentity: jest.fn(),
  setIdentityName: jest.fn(),
  useIdentities: jest.fn(),
  createIdentityRequest: jest.fn(),
}));

describe("ui/components/IdentityList", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  const defaultIdentities: IIdentityData[] = [
    {
      commitment: "0",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #0",
        groups: [],
        urlOrigin: "http://localhost:3000",
        isDeterministic: true,
      },
    },
    {
      commitment: "1",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #1",
        groups: [],
        isDeterministic: true,
      },
    },
  ];

  const defaultProps: IIdentityListProps = {
    isShowAddNew: true,
    isShowMenu: true,
    identities: defaultIdentities,
    selectedCommitment: defaultIdentities[0].commitment,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    mockDispatch.mockResolvedValue(undefined);

    (isExtensionPopupOpen as jest.Mock).mockReturnValue(true);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useIdentities as jest.Mock).mockReturnValue(defaultIdentities);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    render(<IdentityList {...defaultProps} isShowAddNew={false} isShowMenu={false} />);

    const identityName1 = await screen.findByText(defaultIdentities[0].metadata.name);
    const identityName2 = await screen.findByText(defaultIdentities[1].metadata.name);

    expect(identityName1).toBeInTheDocument();
    expect(identityName2).toBeInTheDocument();
  });

  test("should render without identities properly", async () => {
    render(<IdentityList {...defaultProps} identities={[]} />);

    const empty = await screen.findByText("No identities available");

    expect(empty).toBeInTheDocument();
  });

  test("should select identity properly", async () => {
    render(<IdentityList {...defaultProps} />);

    const selectIcon = await screen.findByTestId(`identity-select-${defaultIdentities[1].commitment}`);
    act(() => {
      selectIcon.click();
    });

    expect(defaultProps.onSelect).toBeCalledTimes(1);
  });

  test("should rename identity properly", async () => {
    render(<IdentityList {...defaultProps} />);

    const [menuIcon] = await screen.findAllByTestId("menu");
    act(() => {
      menuIcon.click();
    });

    const renameButton = await screen.findByText("Rename");
    act(() => {
      renameButton.click();
    });

    const input = await screen.findByDisplayValue(defaultIdentities[0].metadata.name);
    fireEvent.change(input, { target: { value: "New name" } });

    const renameIcon = await screen.findByTestId(`identity-rename-${defaultIdentities[0].commitment}`);
    await act(async () => Promise.resolve(renameIcon.click()));

    expect(setIdentityName).toBeCalledTimes(1);
    expect(setIdentityName).toBeCalledWith(defaultIdentities[0].commitment, "New name");
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should handle rename error properly", async () => {
    const error = new Error("error");
    (mockDispatch as jest.Mock).mockRejectedValue(error);

    render(<IdentityList {...defaultProps} />);

    const [menuIcon] = await screen.findAllByTestId("menu");
    act(() => {
      menuIcon.click();
    });

    const renameButton = await screen.findByText("Rename");
    act(() => {
      renameButton.click();
    });

    const input = await screen.findByDisplayValue(defaultIdentities[0].metadata.name);
    fireEvent.change(input, { target: { value: "New name" } });

    const renameIcon = await screen.findByTestId(`identity-rename-${defaultIdentities[0].commitment}`);
    await act(async () => Promise.resolve(renameIcon.click()));

    const errorText = await screen.findByText(error.message);

    expect(errorText).toBeInTheDocument();
  });

  test("should accept to delete identity properly", async () => {
    render(<IdentityList {...defaultProps} selectedCommitment={undefined} />);

    const [menuIcon] = await screen.findAllByTestId("menu");
    act(() => {
      menuIcon.click();
    });

    const deleteButton = await screen.findByText("Delete");
    act(() => {
      deleteButton.click();
    });

    const dangerModal = await screen.findByTestId("danger-modal");

    expect(dangerModal).toBeInTheDocument();

    const dangerModalAccept = await screen.findByTestId("danger-modal-accept");
    await act(async () => Promise.resolve(dangerModalAccept.click()));

    expect(deleteIdentity).toBeCalledTimes(1);
    expect(deleteIdentity).toBeCalledWith(defaultIdentities[0].commitment);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(dangerModal).not.toBeInTheDocument();
  });

  test("should reject to delete identity properly", async () => {
    render(<IdentityList {...defaultProps} selectedCommitment={undefined} />);

    const [menuIcon] = await screen.findAllByTestId("menu");
    act(() => {
      menuIcon.click();
    });

    const deleteButton = await screen.findByText("Delete");
    act(() => {
      deleteButton.click();
    });

    const dangerModal = await screen.findByTestId("danger-modal");

    expect(dangerModal).toBeInTheDocument();

    const dangerModalReject = await screen.findByTestId("danger-modal-reject");
    await act(async () => Promise.resolve(dangerModalReject.click()));

    expect(deleteIdentity).toBeCalledTimes(0);
    expect(mockDispatch).toBeCalledTimes(0);
    expect(dangerModal).not.toBeInTheDocument();
  });

  test("should open create identity modal properly", async () => {
    render(<IdentityList {...defaultProps} />);

    const createIdentityButton = await screen.findByTestId("create-new-identity");
    await act(async () => Promise.resolve(createIdentityButton.click()));

    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should redirect to create identity page properly", async () => {
    (isExtensionPopupOpen as jest.Mock).mockReturnValue(false);

    render(<IdentityList {...defaultProps} />);

    const createIdentityButton = await screen.findByTestId("create-new-identity");
    await act(async () => Promise.resolve(createIdentityButton.click()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.CREATE_IDENTITY);
  });
});
