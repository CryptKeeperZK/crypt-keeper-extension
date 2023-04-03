/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";
import { PendingRequestType } from "@src/types";

import ConfirmRequestModal from "..";
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

  test("should render approval modal properly with inject request type", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: PendingRequestType.INJECT }],
    });

    const { container } = render(
      <Suspense>
        <ConfirmRequestModal />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const modal = await screen.findByTestId("approval-modal");

    expect(modal).toBeInTheDocument();
  });

  test("should render approval modal properly with approve request type", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: PendingRequestType.APPROVE }],
    });

    const { container } = render(
      <Suspense>
        <ConfirmRequestModal />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const modal = await screen.findByTestId("approval-modal");

    expect(modal).toBeInTheDocument();
  });

  test("should render semaphore proof modal properly", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: PendingRequestType.SEMAPHORE_PROOF }],
    });

    const { container } = render(
      <Suspense>
        <ConfirmRequestModal />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const title = await screen.findByText("Generate Semaphore Proof");

    expect(title).toBeInTheDocument();
  });

  test("should render rln proof modal properly", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: PendingRequestType.RLN_PROOF }],
    });

    const { container } = render(
      <Suspense>
        <ConfirmRequestModal />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const title = await screen.findByText("Generate RLN Proof");

    expect(title).toBeInTheDocument();
  });

  test("should render default approval modal properly", async () => {
    (useConfirmRequestModal as jest.Mock).mockReturnValue({
      ...defaultHookData,
      pendingRequests: [{ id: "1", type: "unknown" as unknown as PendingRequestType }],
    });

    const { container } = render(
      <Suspense>
        <ConfirmRequestModal />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const modal = await screen.findByTestId("default-approval-modal");

    expect(modal).toBeInTheDocument();
  });
});
