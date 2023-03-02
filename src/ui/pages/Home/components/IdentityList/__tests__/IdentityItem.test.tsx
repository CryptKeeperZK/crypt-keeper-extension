/**
 * @jest-environment jsdom
 */

import { act, render, screen, fireEvent } from "@testing-library/react";

import { ZERO_ADDRESS } from "@src/config/const";

import { IdentityItem, IdentityItemProps } from "../IdentityItem";

describe("ui/pages/Home/components/IdentityList/IdentityItem", () => {
  const defaultProps: IdentityItemProps = {
    commitment: "1",
    selected: "0",
    metadata: {
      account: ZERO_ADDRESS,
      name: "Account #0",
      identityStrategy: "interrep",
      web2Provider: "twitter",
    },
    onDeleteIdentity: jest.fn(),
    onSelectIdentity: jest.fn(),
    onUpdateIdentityName: jest.fn(),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should render properly", async () => {
    render(<IdentityItem {...defaultProps} />);

    const name = await screen.findByText(defaultProps.metadata.name);
    const provider = await screen.findByText(defaultProps.metadata.web2Provider as string);

    expect(name).toBeInTheDocument();
    expect(provider).toBeInTheDocument();
  });

  test("should delete identity properly", async () => {
    render(<IdentityItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    act(() => menu.click());

    const deleteButton = await screen.findByText("Delete");
    act(() => deleteButton.click());

    expect(defaultProps.onDeleteIdentity).toBeCalledTimes(1);
    expect(defaultProps.onDeleteIdentity).toBeCalledWith(defaultProps.commitment);
  });

  test("should select identity properly", async () => {
    render(
      <IdentityItem
        {...defaultProps}
        metadata={{ ...defaultProps.metadata, identityStrategy: "random", web2Provider: undefined }}
      />,
    );

    const selectIcon = await screen.findByTestId(`identity-select-${defaultProps.commitment}`);
    act(() => selectIcon.click());

    expect(defaultProps.onSelectIdentity).toBeCalledTimes(1);
    expect(defaultProps.onSelectIdentity).toBeCalledWith(defaultProps.commitment);
  });

  test("should rename identity properly", async () => {
    render(<IdentityItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    act(() => menu.click());

    const renameButton = await screen.findByText("Rename");
    act(() => renameButton.click());

    const input = await screen.findByDisplayValue(defaultProps.metadata.name);
    fireEvent.change(input, { target: { value: "Account #1" } });

    const renameIcon = await screen.findByTestId(`identity-rename-${defaultProps.commitment}`);
    await act(async () => renameIcon.click());

    expect(defaultProps.onUpdateIdentityName).toBeCalledTimes(1);
    expect(defaultProps.onUpdateIdentityName).toBeCalledWith(defaultProps.commitment, "Account #1");
  });
});
