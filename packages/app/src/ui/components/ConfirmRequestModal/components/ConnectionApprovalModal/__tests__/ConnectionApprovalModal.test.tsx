/**
 * @jest-environment jsdom
 */

import { PendingRequestType } from "@cryptkeeperzk/types";
import { act, render, screen } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import { ConnectionApprovalModal, IConnectionApprovalModalProps } from "..";
import { useConnectionApprovalModal, IUseConnectionApprovalModalData } from "../useConnectionApprovalModal";

jest.mock("../useConnectionApprovalModal", (): unknown => ({
  useConnectionApprovalModal: jest.fn(),
}));

describe("ui/components/ConfirmRequestModal/components/ConnectionApprovalModal", () => {
  const defaultProps: IConnectionApprovalModalProps = {
    len: 1,
    loading: false,
    error: "",
    pendingRequest: {
      id: "1",
      type: PendingRequestType.APPROVE,
      payload: { origin: "http://localhost:3000" },
    },
    accept: jest.fn(),
    reject: jest.fn(),
  };

  const defaultHookData: IUseConnectionApprovalModalData = {
    host: "http://localhost:3000",
    checked: false,
    faviconUrl: "http://localhost:3000/favicon.ico",
    onAccept: jest.fn(),
    onReject: jest.fn(),
    onSetApproval: jest.fn(),
  };

  beforeEach(() => {
    (useConnectionApprovalModal as jest.Mock).mockReturnValue(defaultHookData);

    createModalRoot();
  });

  afterEach(() => {
    deleteModalRoot();
  });

  test("should render properly", async () => {
    render(<ConnectionApprovalModal {...defaultProps} />);

    const modal = await screen.findByTestId("approval-modal");

    expect(modal).toBeInTheDocument();
  });

  test("should render properly with error", async () => {
    render(<ConnectionApprovalModal {...defaultProps} error="Error" len={2} />);

    const error = await screen.findByText("Error");

    expect(error).toBeInTheDocument();
  });

  test("should accept approval properly", async () => {
    render(<ConnectionApprovalModal {...defaultProps} />);

    const button = await screen.findByText("Approve");
    act(() => {
      button.click();
    });

    expect(defaultHookData.onAccept).toBeCalledTimes(1);
  });

  test("should reject approval properly", async () => {
    render(<ConnectionApprovalModal {...defaultProps} />);

    const button = await screen.findByText("Reject");
    act(() => {
      button.click();
    });

    expect(defaultHookData.onReject).toBeCalledTimes(1);
  });

  test("should select permanent approval properly", async () => {
    render(<ConnectionApprovalModal {...defaultProps} />);

    const label = await screen.findByLabelText("Allow host to create proof without approvals");
    act(() => {
      label.click();
    });

    expect(defaultHookData.onSetApproval).toBeCalledTimes(1);
  });
});
