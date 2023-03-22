/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";
import { PendingRequestType } from "@src/types";

import { ConfirmRequestModal } from "..";
import { IUseConfirmRequestModalData, useConfirmRequestModal } from "../useConfirmRequestModal";

jest.mock("../useConfirmRequestModal", (): unknown => ({
  useConfirmRequestModal: jest.fn(),
}));

describe("ui/components/ConnectionModal/ConnectionModal", () => {
  const defaultHookData: IUseConfirmRequestModalData = {
    error: "",
    loading: false,
    pendingRequests: [],
    accept: jest.fn(),
    reject: jest.fn(),
  };

  beforeEach(() => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue(defaultHookData);

    createModalRoot();
  });

  afterEach(() => {
    deleteModalRoot();
  });

  test("should not render any modal if there is no any pending requests", () => {
    const { container } = render(<ConfirmRequestModal />);

    expect(container.children).toHaveLength(0);
  });

  test("should render approval modal properly with inject request type", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: PendingRequestType.INJECT }],
    });
    render(<ConfirmRequestModal />);

    const modal = await screen.findByTestId("approval-modal");

    expect(modal).toBeInTheDocument();
  });

  test("should render approval modal properly with approve request type", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: PendingRequestType.APPROVE }],
    });
    render(<ConfirmRequestModal />);

    const modal = await screen.findByTestId("approval-modal");

    expect(modal).toBeInTheDocument();
  });

  test("should render semaphore proof modal properly", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: PendingRequestType.SEMAPHORE_PROOF }],
    });
    render(<ConfirmRequestModal />);

    const title = await screen.findByText("Generate Semaphore Proof");

    expect(title).toBeInTheDocument();
  });

  test("should render rln proof modal properly", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: PendingRequestType.RLN_PROOF }],
    });
    render(<ConfirmRequestModal />);

    const title = await screen.findByText("Generate RLN Proof");

    expect(title).toBeInTheDocument();
  });

  test("should render default approval modal properly", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: "unknown" as unknown as PendingRequestType }],
    });
    render(<ConfirmRequestModal />);

    const modal = await screen.findByTestId("default-approval-modal");

    expect(modal).toBeInTheDocument();
  });
});
