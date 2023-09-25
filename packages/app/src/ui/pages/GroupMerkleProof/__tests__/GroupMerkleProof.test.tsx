/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { mockDefaultIdentity } from "@src/config/mock/zk";

import GroupMerkleProof from "..";
import { IUseGroupMerkleProofData, useGroupMerkleProof } from "../useGroupMerkleProof";

jest.mock("../useGroupMerkleProof", (): unknown => ({
  useGroupMerkleProof: jest.fn(),
}));

describe("ui/pages/GroupMerkleProof", () => {
  const defaultHookData: IUseGroupMerkleProofData = {
    isLoading: false,
    isSubmitting: false,
    isJoined: true,
    error: "",
    faviconUrl: "favicon",
    groupId: "groupId",
    connectedIdentity: mockDefaultIdentity,
    onGoBack: jest.fn(),
    onGoToHost: jest.fn(),
    onGoToGroup: jest.fn(),
    onGenerateMerkleProof: jest.fn(),
  };

  beforeEach(() => {
    (useGroupMerkleProof as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <GroupMerkleProof />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("group-merkle-proof-page");

    expect(page).toBeInTheDocument();
  });

  test("should render loading state properly", async () => {
    (useGroupMerkleProof as jest.Mock).mockReturnValue({ ...defaultHookData, isLoading: true });

    const { container, findByText } = render(
      <Suspense>
        <GroupMerkleProof />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const loading = await findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });

  test("should render error state properly", async () => {
    (useGroupMerkleProof as jest.Mock).mockReturnValue({ ...defaultHookData, error: "Error" });

    const { container, findByText } = render(
      <Suspense>
        <GroupMerkleProof />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const error = await findByText("Error");

    expect(error).toBeInTheDocument();
  });

  test("should render empty state properly", async () => {
    (useGroupMerkleProof as jest.Mock).mockReturnValue({
      ...defaultHookData,
      connectedIdentity: undefined,
      groupId: undefined,
      faviconUrl: "",
    });

    const { container, findByText } = render(
      <Suspense>
        <GroupMerkleProof />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const emptyIdentity = await findByText("No connected identity found");
    const emptyGroup = await findByText("No group found");

    expect(emptyIdentity).toBeInTheDocument();
    expect(emptyGroup).toBeInTheDocument();
  });

  test("should render not-joined state properly", async () => {
    (useGroupMerkleProof as jest.Mock).mockReturnValue({ ...defaultHookData, isJoined: false });

    const { container, findByTestId } = render(
      <Suspense>
        <GroupMerkleProof />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const text = await findByTestId("not-joined-text");

    expect(text).toBeInTheDocument();
  });
});
