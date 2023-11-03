/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen } from "@testing-library/react";

import { mockDefaultConnection, mockDefaultGroup, mockDefaultIdentity } from "@src/config/mock/zk";
import { OperationType } from "@src/types";
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
    urlOrigin: mockDefaultConnection.urlOrigin,
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

  test("should delete activity operation properly", async () => {
    render(<ActivityItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    await act(async () => Promise.resolve(menu.click()));

    const deleteButton = await screen.findByText("Delete");
    await act(async () => Promise.resolve(deleteButton.click()));

    const yesButton = await screen.findByText("Yes");
    await act(async () => Promise.resolve(yesButton.click()));

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDelete).toHaveBeenCalledWith("1");
  });

  test("should go to connected url origin properly", async () => {
    render(<ActivityItem {...defaultProps} />);

    const urlOrigin = await screen.findByTestId("url-origin");
    await act(() => fireEvent.click(urlOrigin));

    expect(redirectToNewTab).toHaveBeenCalledTimes(1);
    expect(redirectToNewTab).toHaveBeenCalledWith(defaultProps.urlOrigin);
  });

  test("should go to group properly", async () => {
    render(<ActivityItem {...defaultProps} urlOrigin={undefined} />);

    const group = await screen.findByTestId("group");
    await act(() => fireEvent.click(group));

    expect(redirectToNewTab).toHaveBeenCalledTimes(1);
    expect(redirectToNewTab).toHaveBeenCalledWith(getBandadaGroupUrl(defaultProps.operation.group!.id!));
  });
});
