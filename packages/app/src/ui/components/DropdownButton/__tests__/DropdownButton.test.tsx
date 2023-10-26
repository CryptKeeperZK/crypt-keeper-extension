/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render } from "@testing-library/react";

import { DropdownButton, IDropdownButtonProps } from "..";

describe("ui/components/DropdownButton", () => {
  const defaultProps: IDropdownButtonProps = {
    options: [
      {
        id: "metamask",
        title: "Connect to MetaMask",
        checkDisabledItem: () => true,
      },
      {
        id: "cryptkeeper",
        title: "Sign with CryptKeeper",
        checkDisabledItem: () => false,
      },
      {
        id: "empty",
        title: "Proceed without Signing",
      },
    ],
    onClick: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { findByTestId } = render(<DropdownButton {...defaultProps} />);

    const button = await findByTestId("dropdown-button");
    const menuButton = await findByTestId("dropdown-menu-button");

    expect(button).toBeInTheDocument();
    expect(menuButton).toBeInTheDocument();
  });

  test("should render menu properly", async () => {
    const { findByTestId } = render(<DropdownButton {...defaultProps} />);

    const menuButton = await findByTestId("dropdown-menu-button");
    act(() => fireEvent.click(menuButton));

    const menu = await findByTestId("menu-paper");
    expect(menu).toBeInTheDocument();
  });

  test("should select menu item properly", async () => {
    const { findByTestId, findByText } = render(<DropdownButton {...defaultProps} />);

    const menuButton = await findByTestId("dropdown-menu-button");
    act(() => fireEvent.click(menuButton));

    const menuItem = await findByTestId("dropdown-menu-item-1");
    act(() => fireEvent.click(menuItem));

    const selectedItem = await findByText(defaultProps.options[1].title);
    expect(selectedItem).toBeInTheDocument();
  });
});
