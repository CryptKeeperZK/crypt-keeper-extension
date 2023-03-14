/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";

import { TabList, TabListProps } from "..";

describe("ui/pages/Home/components/TabList", () => {
  const defaultProps: TabListProps = {
    children: [],
    onDeleteAllIdentities: jest.fn(),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should render properly", async () => {
    render(<TabList {...defaultProps} />);

    const component = await screen.findByTestId("tab-list");

    expect(component).toBeInTheDocument();
  });

  test("should delete all identities properly", async () => {
    render(<TabList {...defaultProps} />);

    const icon = await screen.findByTestId("menu-icon");
    await act(async () => Promise.resolve(icon.click()));

    const deleteAllButton = await screen.findByText("Delete all");
    await act(async () => Promise.resolve(deleteAllButton.click()));

    expect(defaultProps.onDeleteAllIdentities).toBeCalledTimes(1);
  });
});
