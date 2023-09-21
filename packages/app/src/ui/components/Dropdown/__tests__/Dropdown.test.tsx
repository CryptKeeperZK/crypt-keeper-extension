/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import selectEvent from "react-select-event";

import { Dropdown, IDropdownProps } from "..";

describe("ui/components/Dropdown", () => {
  const defaultProps: IDropdownProps = {
    id: "web2Provider",
    label: "Web2 Provider",
    options: [
      { label: "Twitter", value: "twitter", icon: ["fab", "twitter"] },
      { label: "Github", value: "github", icon: ["fab", "github"] },
      { label: "Reddit", value: "reddit", icon: ["fab", "reddit"] },
    ],
    onChange: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    render(<Dropdown {...defaultProps} />);

    const web2ProviderLabel = await screen.findByText("Web2 Provider");
    const selectPlaceholder = await screen.findByText("Choose");

    expect(web2ProviderLabel).toBeInTheDocument();
    expect(selectPlaceholder).toBeInTheDocument();
  });

  test("should render properly with error message", async () => {
    render(<Dropdown {...defaultProps} errorMessage="Error message" />);

    const errorMessage = await screen.findByText("Error message");

    expect(errorMessage).toBeInTheDocument();
  });

  test("should select new value properly", async () => {
    render(<Dropdown {...defaultProps} value={defaultProps.options[0]} />);

    const select = await screen.findByLabelText(defaultProps.label);
    await selectEvent.select(select, defaultProps.options[1].label);

    expect(defaultProps.onChange).toBeCalledTimes(1);
    expect(defaultProps.onChange).toBeCalledWith(defaultProps.options[1], {
      action: "select-option",
    });
  });
});
