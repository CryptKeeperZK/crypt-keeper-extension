/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";

import { ConnectTabList, ConnectTabListProps } from "..";

describe("ui/pages/Home/components/ConnectTabList", () => {
  const defaultProps: ConnectTabListProps = {
    isShowTabs: true,
    children: [<div key={0}>Identities content</div>, <div key={1}>Activity content</div>],
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should render properly", async () => {
    render(<ConnectTabList {...defaultProps} isShowTabs={false} />);

    const component = await screen.findByTestId("tab-list");

    expect(component).toBeInTheDocument();
  });

  test("should select tabs properly", async () => {
    render(<ConnectTabList {...defaultProps} />);

    const tabIdentities = await screen.findByTestId("tab-identities");
    act(() => tabIdentities.click());

    const identitiesContent = await screen.findByText("Identities content");
    expect(identitiesContent).toBeInTheDocument();

    const tabActivity = await screen.findByTestId("tab-activity");
    act(() => tabActivity.click());

    const activityContent = await screen.findByText("Activity content");
    expect(activityContent).toBeInTheDocument();
  });
});
