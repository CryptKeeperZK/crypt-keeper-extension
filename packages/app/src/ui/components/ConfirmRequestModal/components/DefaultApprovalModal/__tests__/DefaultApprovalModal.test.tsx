/**
 * @jest-environment jsdom
 */

import { PendingRequestType } from "@cryptkeeperzk/types";
import { act, render, screen } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import { DefaultApprovalModal, IDefaultApprovalModalProps } from "..";

describe("ui/components/ConfirmRequestModal/components/DefaultApprovalModal", () => {
  const defaultProps: IDefaultApprovalModalProps = {
    len: 1,
    loading: false,
    error: "",
    pendingRequest: {
      id: "1",
      type: PendingRequestType.APPROVE,
    },
    accept: jest.fn(),
    reject: jest.fn(),
  };

  beforeEach(() => {
    createModalRoot();
  });

  afterEach(() => {
    deleteModalRoot();
  });

  test("should render properly", async () => {
    render(<DefaultApprovalModal {...defaultProps} />);

    const modal = await screen.findByTestId("default-approval-modal");

    expect(modal).toBeInTheDocument();
  });

  test("should render properly with error", async () => {
    render(<DefaultApprovalModal {...defaultProps} error="Error" len={2} pendingRequest={undefined} />);

    const error = await screen.findByText("Error");

    expect(error).toBeInTheDocument();
  });

  test("should not approve unknown operations", async () => {
    render(<DefaultApprovalModal {...defaultProps} />);

    const button = await screen.findByText("Approve");
    act(() => button.click());

    expect(defaultProps.accept).not.toBeCalled();
  });

  test("should reject properly", async () => {
    render(<DefaultApprovalModal {...defaultProps} />);

    const button = await screen.findByText("Reject");
    act(() => button.click());

    expect(defaultProps.reject).toBeCalledTimes(1);
  });
});
