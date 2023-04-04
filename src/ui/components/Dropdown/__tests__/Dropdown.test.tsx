/**
 * @jest-environment jsdom
 */

import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";
import { render, screen } from "@testing-library/react";
import selectEvent from "react-select-event";

import { WEB2_PROVIDER_OPTIONS } from "@src/constants";

import { Dropdown, DropdownProps } from "..";

describe("ui/components/Dropdown", () => {
  const defaultProps: DropdownProps = {
    id: "web2Provider",
    label: "Web2 Provider",
    options: WEB2_PROVIDER_OPTIONS,
    onChange: jest.fn(),
  };

  afterEach(() => {
    library.add(faTwitter, faGithub, faReddit);

    jest.resetAllMocks();
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
    render(<Dropdown {...defaultProps} value={WEB2_PROVIDER_OPTIONS[0]} />);

    const select = await screen.findByLabelText(defaultProps.label);
    await selectEvent.select(select, WEB2_PROVIDER_OPTIONS[1].label);

    expect(defaultProps.onChange).toBeCalledTimes(1);
    expect(defaultProps.onChange).toBeCalledWith(WEB2_PROVIDER_OPTIONS[1], {
      action: "select-option",
    });
  });
});
