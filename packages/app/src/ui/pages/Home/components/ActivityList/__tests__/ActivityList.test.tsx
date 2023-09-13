/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";

import { mockDefaultIdentity } from "@src/config/mock/zk";
import { Operation, OperationType } from "@src/types";

import { ActivityList } from "..";
import { IUseActivityListData, useActivityList } from "../useActivityList";

jest.mock("../useActivityList", (): unknown => ({
  useActivityList: jest.fn(),
}));

describe("ui/pages/Home/components/ActivityList", () => {
  const defaultIdentityOperations: Operation[] = [
    {
      id: "1",
      type: OperationType.CREATE_IDENTITY,
      identity: mockDefaultIdentity,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: OperationType.DELETE_IDENTITY,
      identity: mockDefaultIdentity,
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultHookData: IUseActivityListData = {
    isLoading: false,
    operations: defaultIdentityOperations,
    onDeleteHistoryOperation: jest.fn(),
  };

  beforeEach(() => {
    (useActivityList as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    render(<ActivityList />);

    const operation1 = await screen.findByTestId("activity-operation-1");
    const operation2 = await screen.findByTestId("activity-operation-2");

    expect(operation1).toBeInTheDocument();
    expect(operation2).toBeInTheDocument();
  });

  test("should render properly if there is no any operations", async () => {
    (useActivityList as jest.Mock).mockReturnValue({ ...defaultHookData, isLoading: true });

    render(<ActivityList />);

    const loading = await screen.findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });

  test("should render properly if there is no any operations", async () => {
    (useActivityList as jest.Mock).mockReturnValue({ ...defaultHookData, operations: [] });

    render(<ActivityList />);

    const noRecords = await screen.findByText("No records found");

    expect(noRecords).toBeInTheDocument();
  });

  test("should delete activity operation properly", async () => {
    render(<ActivityList />);

    const [menu] = await screen.findAllByTestId("menu");
    await act(async () => Promise.resolve(menu.click()));

    const deleteButton = await screen.findByText("Delete");
    await act(async () => Promise.resolve(deleteButton.click()));

    const yesButton = await screen.findByText("Yes");
    await act(async () => Promise.resolve(yesButton.click()));

    expect(defaultHookData.onDeleteHistoryOperation).toBeCalledTimes(1);
    expect(defaultHookData.onDeleteHistoryOperation).toBeCalledWith("1");
  });
});
