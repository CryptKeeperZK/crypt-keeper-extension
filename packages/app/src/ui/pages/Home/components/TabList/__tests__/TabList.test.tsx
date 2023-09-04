/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";

import { getEnabledFeatures } from "@src/config/features";

import { TabList, ITabListProps } from "..";

describe("ui/pages/Home/components/TabList", () => {
  const defaultProps: ITabListProps = {
    children: [<div key={0}>Identities content</div>, <div key={1}>Activity content</div>],
  };

  beforeEach(() => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ VERIFIABLE_CREDENTIALS: true });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should render properly", async () => {
    render(<TabList {...defaultProps} />);

    const component = await screen.findByTestId("tab-list");

    expect(component).toBeInTheDocument();
  });

  test("should select tabs properly", async () => {
    render(<TabList {...defaultProps} />);

    const tabIdentities = await screen.findByTestId("tab-identities");
    act(() => {
      tabIdentities.click();
    });

    const identitiesContent = await screen.findByText("Identities content");
    expect(identitiesContent).toBeInTheDocument();

    const tabActivity = await screen.findByTestId("tab-activity");
    act(() => {
      tabActivity.click();
    });

    const activityContent = await screen.findByText("Activity content");
    expect(activityContent).toBeInTheDocument();
  });
});
