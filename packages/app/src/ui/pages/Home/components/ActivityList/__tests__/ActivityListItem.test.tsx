/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen } from "@testing-library/react";

import { mockDefaultGroup, mockDefaultIdentity } from "@src/config/mock/zk";
import { Operation, OperationType } from "@src/types";
import { redirectToNewTab } from "@src/util/browser";
import { getBandadaGroupUrl } from "@src/util/groups";

import { ActivityItem, IActivityItemProps } from "../Item";

jest.mock("@src/util/browser", (): unknown => ({
  redirectToNewTab: jest.fn(),
}));

describe("ui/pages/Home/components/ActivityList/Item", () => {
  const defaultProps: IActivityItemProps = {
    operation: {
      id: "1",
      type: OperationType.JOIN_GROUP,
      identity: mockDefaultIdentity,
      group: mockDefaultGroup,
      createdAt: new Date().toISOString(),
    },
    onDelete: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    render(<ActivityItem {...defaultProps} />);

    const activity = await screen.findByTestId("activity-operation-1");

    expect(activity).toBeInTheDocument();
  });

  test("should render random identity properly", async () => {
    const operation: Operation = {
      ...defaultProps.operation,
      identity: {
        ...defaultProps.operation.identity!,
        metadata: {
          ...defaultProps.operation.identity!.metadata,
          web2Provider: undefined,
          identityStrategy: "random",
        },
      },
    };

    render(<ActivityItem {...defaultProps} operation={operation} />);

    const random = await screen.findByText("random");

    expect(random).toBeInTheDocument();
  });

  test("should delete activity operation properly", async () => {
    render(<ActivityItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    await act(async () => Promise.resolve(menu.click()));

    const deleteButton = await screen.findByText("Delete");
    await act(async () => Promise.resolve(deleteButton.click()));

    const yesButton = await screen.findByText("Yes");
    await act(async () => Promise.resolve(yesButton.click()));

    expect(defaultProps.onDelete).toBeCalledTimes(1);
    expect(defaultProps.onDelete).toBeCalledWith("1");
  });

  test("should go to connected host properly", async () => {
    render(<ActivityItem {...defaultProps} />);

    const host = await screen.findByTestId("host");
    await act(() => fireEvent.click(host));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(defaultProps.operation.identity?.metadata.host);
  });

  test("should go to group properly", async () => {
    render(<ActivityItem {...defaultProps} />);

    const group = await screen.findByTestId("group");
    await act(() => fireEvent.click(group));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(getBandadaGroupUrl(defaultProps.operation.group!.id!));
  });
});
