/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { mockDefaultIdentity } from "@src/config/mock/zk";

import JoinGroup from "..";
import { IUseJoinGroupData, useJoinGroup } from "../useJoinGroup";

jest.mock("../useJoinGroup", (): unknown => ({
  useJoinGroup: jest.fn(),
}));

describe("ui/pages/JoinGroup", () => {
  const defaultHookData: IUseJoinGroupData = {
    isLoading: false,
    isJoined: false,
    isSubmitting: false,
    error: "",
    faviconUrl: "favicon",
    groupId: "groupId",
    apiKey: "apiKey",
    inviteCode: "inviteCode",
    connectedIdentity: mockDefaultIdentity,
    onGoBack: jest.fn(),
    onGoToHost: jest.fn(),
    onGoToGroup: jest.fn(),
    onJoin: jest.fn(),
  };

  beforeEach(() => {
    (useJoinGroup as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <JoinGroup />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("join-group-page");

    expect(page).toBeInTheDocument();
  });

  test("should render loading state properly", async () => {
    (useJoinGroup as jest.Mock).mockReturnValue({ ...defaultHookData, isLoading: true });

    const { container, findByText } = render(
      <Suspense>
        <JoinGroup />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const loading = await findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });

  test("should render error state properly", async () => {
    (useJoinGroup as jest.Mock).mockReturnValue({ ...defaultHookData, error: "Error" });

    const { container, findByText } = render(
      <Suspense>
        <JoinGroup />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const error = await findByText("Error");

    expect(error).toBeInTheDocument();
  });

  test("should render empty state properly", async () => {
    (useJoinGroup as jest.Mock).mockReturnValue({
      ...defaultHookData,
      connectedIdentity: undefined,
      groupId: undefined,
      inviteCode: undefined,
      apiKey: undefined,
      faviconUrl: "",
    });

    const { container, findByText } = render(
      <Suspense>
        <JoinGroup />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const emptyIdentity = await findByText("No connected identity found");
    const emptyGroup = await findByText("No group found");

    expect(emptyIdentity).toBeInTheDocument();
    expect(emptyGroup).toBeInTheDocument();
  });

  test("should render joined state properly", async () => {
    (useJoinGroup as jest.Mock).mockReturnValue({ ...defaultHookData, isJoined: true });

    const { container, findByTestId } = render(
      <Suspense>
        <JoinGroup />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const text = await findByTestId("joined-text");

    expect(text).toBeInTheDocument();
  });
});
