/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { createDataTransfer, mockJsonFile } from "@src/config/mock/file";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";

import UploadBackup from "..";
import { IUseUploadBackupData, useUploadBackup } from "../useUploadBackup";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
  useCryptKeeperWallet: jest.fn(),
}));

jest.mock("../useUploadBackup", (): unknown => ({
  useUploadBackup: jest.fn(),
}));

describe("ui/pages/UploadBackup", () => {
  const defaultHookData: IUseUploadBackupData = {
    isLoading: false,
    isShowPassword: false,
    register: jest.fn(),
    errors: {},
    onDrop: jest.fn(),
    onShowPassword: jest.fn(),
    onSubmit: jest.fn(),
    onGoBack: jest.fn(),
  };

  beforeEach(() => {
    (useEthWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useCryptKeeperWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useUploadBackup as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <UploadBackup />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("upload-backup-page");

    expect(page).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    const { container, findByLabelText, findByTestId } = render(
      <Suspense>
        <UploadBackup />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const data = createDataTransfer([mockJsonFile]);
    await act(() => fireEvent.drop(container.querySelector(".dropzone")!, data));

    const passwordInput = await findByLabelText("Password");
    await act(() => fireEvent.change(passwordInput, { target: { value: "password" } }));

    const backupPasswordInput = await findByLabelText("Backup password");
    await act(() => fireEvent.change(backupPasswordInput, { target: { value: "password" } }));

    const button = await findByTestId("upload-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(defaultHookData.onDrop).toHaveBeenCalledTimes(1);
    expect(defaultHookData.onSubmit).toHaveBeenCalledTimes(1);
  });
});
