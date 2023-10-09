/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { mockDefaultIdentity } from "@src/config/mock/zk";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";

import Identity from "..";
import { IUseIdentityPageData, useIdentityPage } from "../useIdentityPage";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
  useCryptKeeperWallet: jest.fn(),
}));

jest.mock("../useIdentityPage", (): unknown => ({
  useIdentityPage: jest.fn(),
}));

describe("ui/pages/Identity", () => {
  const defaultHookData: IUseIdentityPageData = {
    isLoading: false,
    isConnectedIdentity: false,
    isConfirmModalOpen: false,
    isUpdating: false,
    errors: {},
    commitment: mockDefaultIdentity.commitment,
    metadata: {
      ...mockDefaultIdentity.metadata,
      groups: [{ id: "1", name: "Group #1", description: "Description #1" }],
    },
    register: jest.fn(),
    onGoBack: jest.fn(),
    onConfirmDeleteIdentity: jest.fn(),
    onDeleteIdentity: jest.fn(),
    onUpdateIdentity: jest.fn(),
    onGoToHost: jest.fn(),
    onConfirmUpdate: jest.fn(),
  };

  beforeEach(() => {
    (useIdentityPage as jest.Mock).mockReturnValue(defaultHookData);

    (useEthWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useCryptKeeperWallet as jest.Mock).mockReturnValue(defaultWalletHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <Identity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("identity-page");

    expect(page).toBeInTheDocument();
  });

  test("should render loading state properly", async () => {
    (useIdentityPage as jest.Mock).mockReturnValue({ ...defaultHookData, isLoading: true });

    const { container, findByText } = render(
      <Suspense>
        <Identity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const loading = await findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });

  test("should render error state properly", async () => {
    (useIdentityPage as jest.Mock).mockReturnValue({ ...defaultHookData, errors: { name: "Error" } });

    const { container, findByText, queryByText } = render(
      <Suspense>
        <Identity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const error = await findByText("Error");
    const emptyContent = queryByText("No such identity");

    expect(error).toBeInTheDocument();
    expect(emptyContent).toBeNull();
  });

  test("should render empty state properly", async () => {
    (useIdentityPage as jest.Mock).mockReturnValue({ ...defaultHookData, commitment: undefined });

    const { container, findByText, queryByText } = render(
      <Suspense>
        <Identity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const emptyContent = await findByText("No such identity");
    const error = queryByText("Error");

    expect(emptyContent).toBeInTheDocument();
    expect(error).toBeNull();
  });

  test("should render properly without urlOrigin and groups", async () => {
    (useIdentityPage as jest.Mock).mockReturnValue({
      ...defaultHookData,
      metadata: { ...defaultHookData.metadata, groups: [], urlOrigin: undefined },
    });

    const { container, findByText } = render(
      <Suspense>
        <Identity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const emptyGroups = await findByText("No groups are available");
    const emptyHost = await findByText("Not specified");

    expect(emptyGroups).toBeInTheDocument();
    expect(emptyHost).toBeInTheDocument();
  });

  test("should initiate identity removal properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <Identity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByText("Delete");
    await act(() => Promise.resolve(button.click()));

    expect(defaultHookData.onConfirmDeleteIdentity).toBeCalledTimes(1);
  });

  test("should delete identity properly", async () => {
    (useIdentityPage as jest.Mock).mockReturnValue({
      ...defaultHookData,
      isConfirmModalOpen: true,
    });

    const { container, findByTestId } = render(
      <Suspense>
        <Identity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const noButton = await findByTestId("danger-modal-reject");
    await act(() => Promise.resolve(noButton.click()));
    expect(defaultHookData.onConfirmDeleteIdentity).toBeCalledTimes(1);

    const yesButton = await findByTestId("danger-modal-accept");
    await act(() => Promise.resolve(yesButton.click()));
    expect(defaultHookData.onDeleteIdentity).toBeCalledTimes(1);
  });

  test("should render update form properly", async () => {
    (useIdentityPage as jest.Mock).mockReturnValue({
      ...defaultHookData,
      isUpdating: true,
    });

    const { container, findByText } = render(
      <Suspense>
        <Identity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const confirmButton = await findByText("Confirm");
    await act(() => Promise.resolve(confirmButton.click()));

    expect(defaultHookData.onConfirmUpdate).toBeCalledTimes(1);
  });
});
