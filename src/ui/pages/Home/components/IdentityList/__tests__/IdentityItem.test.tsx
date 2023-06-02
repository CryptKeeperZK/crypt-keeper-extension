/**
 * @jest-environment jsdom
 */

import { library } from "@fortawesome/fontawesome-svg-core";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";
import { act, render, screen, fireEvent } from "@testing-library/react";

import { ZERO_ADDRESS } from "@src/config/const";
import { getEnabledFeatures } from "@src/config/features";

import { IdentityItem, IdentityItemProps } from "../Item";

describe("ui/pages/Home/components/IdentityList/Item", () => {
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

  beforeEach(() => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTERREP_IDENTITY: true });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should render properly", async () => {
    library.add(faTwitter);

    render(<IdentityItem {...defaultProps} />);

    const name = await screen.findByText(defaultProps.metadata.name);
    const provider = await screen.findByText(defaultProps.metadata.web2Provider as string);

    expect(name).toBeInTheDocument();
    expect(provider).toBeInTheDocument();
  });

  test("should render identity properly with disabled interrep identity", async () => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTERREP_IDENTITY: false });

    render(
      <IdentityItem
        {...defaultProps}
        metadata={{
          ...defaultProps.metadata,
          identityStrategy: "random",
        }}
      />,
    );

    const name = await screen.findByText(defaultProps.metadata.name);

    expect(name).toBeInTheDocument();
  });

  test("should render random identity properly with enabled interrep identity", async () => {
    render(
      <IdentityItem
        {...defaultProps}
        metadata={{
          ...defaultProps.metadata,
          web2Provider: undefined,
          identityStrategy: "random",
        }}
      />,
    );

    const name = await screen.findByText(defaultProps.metadata.name);
    const random = await screen.findByText("random");

    expect(name).toBeInTheDocument();
    expect(random).toBeInTheDocument();
  });

  test("should accept to delete identity properly", async () => {
    render(<IdentityItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    act(() => menu.click());

    const deleteButton = await screen.findByText("Delete");
    act(() => deleteButton.click());

    const dangerModal = await screen.findByTestId("danger-modal");

    expect(dangerModal).toBeInTheDocument();

    const dangerModalAccept = await screen.findByTestId("danger-modal-accept");
    await act(async () => Promise.resolve(dangerModalAccept.click()));

    expect(defaultProps.onDeleteIdentity).toBeCalledTimes(1);
    expect(defaultProps.onDeleteIdentity).toBeCalledWith(defaultProps.commitment);
    expect(dangerModal).not.toBeInTheDocument();
  });

  test("should reject to delete identity properly", async () => {
    render(<IdentityItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    act(() => menu.click());

    const deleteButton = await screen.findByText("Delete");
    act(() => deleteButton.click());

    const dangerModal = await screen.findByTestId("danger-modal");

    expect(dangerModal).toBeInTheDocument();

    const dangerModalreject = await screen.findByTestId("danger-modal-reject");
    await act(async () => Promise.resolve(dangerModalreject.click()));

    expect(defaultProps.onDeleteIdentity).toBeCalledTimes(0);
    expect(dangerModal).not.toBeInTheDocument();
  });

  test("should select identity properly", async () => {
    render(
      <IdentityItem
        {...defaultProps}
        metadata={{ ...defaultProps.metadata, identityStrategy: "random", web2Provider: undefined }}
        selected={undefined}
      />,
    );

    const selectIcon = await screen.findByTestId(`identity-select-${defaultProps.commitment}`);
    act(() => selectIcon.click());

    expect(defaultProps.onSelectIdentity).toBeCalledTimes(1);
    expect(defaultProps.onSelectIdentity).toBeCalledWith(defaultProps.commitment);
  });

  test("should rename identity properly", async () => {
    (defaultProps.onUpdateIdentityName as jest.Mock).mockResolvedValue(true);

    render(<IdentityItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    act(() => menu.click());

    const renameButton = await screen.findByText("Rename");
    act(() => renameButton.click());

    const input = await screen.findByDisplayValue(defaultProps.metadata.name);
    fireEvent.change(input, { target: { value: "Account #1" } });

    const renameIcon = await screen.findByTestId(`identity-rename-${defaultProps.commitment}`);
    await act(async () => Promise.resolve(renameIcon.click()));

    expect(defaultProps.onUpdateIdentityName).toBeCalledTimes(1);
    expect(defaultProps.onUpdateIdentityName).toBeCalledWith(defaultProps.commitment, "Account #1");
  });
});
