/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import { ConnectionModal, ConnectionModalProps } from "..";
import { IUseConnectionModalData, useConnectionModal } from "../useConnectionModal";

jest.mock("../useConnectionModal", (): unknown => ({
  useConnectionModal: jest.fn(),
}));

describe("ui/components/ConnectionModal/ConnectionModal", () => {
  const defaultProps: ConnectionModalProps = {
    refreshConnectionStatus: jest.fn(),
    onClose: jest.fn(),
  };

  const defaultHookData: IUseConnectionModalData = {
    url: new URL("http://localhost:3000"),
    checked: false,
    faviconUrl: "http://localhost:3000/favicon.ico",
    onSetApproval: jest.fn(),
    onRemoveHost: jest.fn(),
  };

  beforeEach(() => {
    (useConnectionModal as jest.Mock).mockReturnValue(defaultHookData);

    createModalRoot();
  });

  afterEach(() => {
    deleteModalRoot();
  });

  test("should render properly", async () => {
    render(<ConnectionModal {...defaultProps} />);

    const modal = await screen.findByTestId("connection-modal");
    const host = await screen.findByText(defaultHookData.url?.host as string);

    expect(modal).toBeInTheDocument();
    expect(host).toBeInTheDocument();
  });

  test("should render properly with chrome extension protocol", async () => {
    (useConnectionModal as jest.Mock).mockReturnValue({ ...defaultHookData, url: new URL("chrome-extension://id") });
    render(<ConnectionModal {...defaultProps} />);

    const modal = await screen.findByTestId("connection-modal");
    const title = await screen.findByText("Chrome Extension Page");

    expect(modal).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  test("should remove host properly", async () => {
    render(<ConnectionModal {...defaultProps} />);

    const button = await screen.findByText("Disconnect");
    act(() => button.click());

    expect(defaultHookData.onRemoveHost).toBeCalledTimes(1);
  });

  test("should close modal properly", async () => {
    render(<ConnectionModal {...defaultProps} />);

    const button = await screen.findByText("Close");
    act(() => button.click());

    expect(defaultProps.onClose).toBeCalledTimes(1);
  });

  test("should set approval properly", async () => {
    render(<ConnectionModal {...defaultProps} />);

    const button = await screen.findByLabelText("Allow host to create proof without approvals");
    act(() => button.click());

    expect(defaultHookData.onSetApproval).toBeCalledTimes(1);
  });
});
