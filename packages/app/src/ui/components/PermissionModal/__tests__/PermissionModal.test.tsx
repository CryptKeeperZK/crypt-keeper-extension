/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import { PermissionModal, IPermissionModalProps } from "..";
import { IUsePermissionModalData, usePermissionModal } from "../usePermissionModal";

jest.mock("../usePermissionModal", (): unknown => ({
  usePermissionModal: jest.fn(),
}));

describe("ui/components/ConnectionModal/ConnectionModal", () => {
  const defaultProps: IPermissionModalProps = {
    refreshConnectionStatus: jest.fn(),
    onClose: jest.fn(),
  };

  const defaultHookData: IUsePermissionModalData = {
    url: new URL("http://localhost:3000"),
    checked: false,
    faviconUrl: "http://localhost:3000/favicon.ico",
    onSetApproval: jest.fn(),
    onRemoveHost: jest.fn(),
  };

  beforeEach(() => {
    (usePermissionModal as jest.Mock).mockReturnValue(defaultHookData);

    createModalRoot();
  });

  afterEach(() => {
    deleteModalRoot();
  });

  test("should render properly", async () => {
    render(<PermissionModal {...defaultProps} />);

    const modal = await screen.findByTestId("connection-modal");
    const host = await screen.findByText(defaultHookData.url!.host);

    expect(modal).toBeInTheDocument();
    expect(host).toBeInTheDocument();
  });

  test("should render properly with chrome extension protocol", async () => {
    (usePermissionModal as jest.Mock).mockReturnValue({ ...defaultHookData, url: new URL("chrome-extension://id") });
    render(<PermissionModal {...defaultProps} />);

    const modal = await screen.findByTestId("connection-modal");
    const title = await screen.findByText("Chrome Extension Page");

    expect(modal).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  test("should remove host properly", async () => {
    render(<PermissionModal {...defaultProps} />);

    const button = await screen.findByText("Disconnect");
    act(() => {
      button.click();
    });

    expect(defaultHookData.onRemoveHost).toBeCalledTimes(1);
  });

  test("should close modal properly", async () => {
    render(<PermissionModal {...defaultProps} />);

    const button = await screen.findByText("Close");
    act(() => {
      button.click();
    });

    expect(defaultProps.onClose).toBeCalledTimes(1);
  });

  test("should set approval properly", async () => {
    render(<PermissionModal {...defaultProps} />);

    const button = await screen.findByLabelText("Allow host to create proof without approvals");
    act(() => {
      button.click();
    });

    expect(defaultHookData.onSetApproval).toBeCalledTimes(1);
  });
});
