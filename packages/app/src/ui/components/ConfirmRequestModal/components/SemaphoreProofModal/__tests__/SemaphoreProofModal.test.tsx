/**
 * @jest-environment jsdom
 */

import { PendingRequestType } from "@cryptkeeperzk/types";
import { act, render, screen } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import { SemaphoreProofModal, SemaphoreProofModalProps } from "..";
import { IUseSemaphoreProofModalData, useSemaphoreProofModal } from "../useSemaphoreProofModal";

jest.mock("../useSemaphoreProofModal", (): unknown => ({
  useSemaphoreProofModal: jest.fn(),
}));

describe("ui/components/ConfirmRequestModal/components/ProofModal", () => {
  const defaultProps: SemaphoreProofModalProps = {
    len: 1,
    loading: false,
    error: "",
    pendingRequest: {
      id: "1",
      type: PendingRequestType.SEMAPHORE_PROOF,
      payload: {
        externalNullifier: "externalNullifier",
        signal: "0x1",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
        urlOrigin: "http://localhost:3000",
      },
    },
    accept: jest.fn(),
    reject: jest.fn(),
  };

  const defaultHookData: IUseSemaphoreProofModalData = {
    urlOrigin: defaultProps.pendingRequest.payload!.urlOrigin,
    faviconUrl: "",
    operation: "Generate Semaphore Proof",
    payload: defaultProps.pendingRequest.payload,
    onAccept: jest.fn(),
    onReject: jest.fn(),
    onOpenCircuitFile: jest.fn(),
    onOpenZkeyFile: jest.fn(),
    onOpenVerificationKeyFile: jest.fn(),
  };

  beforeEach(() => {
    (useSemaphoreProofModal as jest.Mock).mockReturnValue(defaultHookData);

    createModalRoot();
  });

  afterEach(() => {
    deleteModalRoot();
  });

  test("should render properly", async () => {
    render(<SemaphoreProofModal {...defaultProps} />);

    const modal = await screen.findByTestId("proof-modal");

    expect(modal).toBeInTheDocument();
  });

  test("should render properly with error", async () => {
    render(<SemaphoreProofModal {...defaultProps} error="Error" len={2} />);

    const error = await screen.findByText("Error");

    expect(error).toBeInTheDocument();
  });

  test("should approve generation properly", async () => {
    render(<SemaphoreProofModal {...defaultProps} />);

    const button = await screen.findByText("Approve");
    act(() => {
      button.click();
    });

    expect(defaultHookData.onAccept).toBeCalledTimes(1);
  });

  test("should reject proof generation properly", async () => {
    render(<SemaphoreProofModal {...defaultProps} />);

    const button = await screen.findByText("Reject");
    act(() => {
      button.click();
    });

    expect(defaultHookData.onReject).toBeCalledTimes(1);
  });

  test("should open circuit file properly", async () => {
    render(<SemaphoreProofModal {...defaultProps} />);

    const link = await screen.findByTestId("circuit-file-link");
    act(() => {
      link.click();
    });

    expect(defaultHookData.onOpenCircuitFile).toBeCalledTimes(1);
  });

  test("should open zkey file properly", async () => {
    render(<SemaphoreProofModal {...defaultProps} />);

    const link = await screen.findByTestId("zkey-file-link");
    act(() => {
      link.click();
    });

    expect(defaultHookData.onOpenZkeyFile).toBeCalledTimes(1);
  });

  test("should open verification key file properly", async () => {
    render(<SemaphoreProofModal {...defaultProps} />);

    const link = await screen.findByTestId("verification-key-file-link");
    act(() => {
      link.click();
    });

    expect(defaultHookData.onOpenVerificationKeyFile).toBeCalledTimes(1);
  });
});
