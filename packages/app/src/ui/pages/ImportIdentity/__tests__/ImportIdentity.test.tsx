/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { mockDefaultIdentity, mockDefaultIdentityCommitment, mockDefaultIdentitySecret } from "@src/config/mock/zk";

import ImportIdentity from "..";
import { IUseImportIdentityData, useImportIdentity } from "../useImportIdentity";

jest.mock("bigint-conversion", (): unknown => ({
  bigintToHex: jest.fn(),
}));

jest.mock("../useImportIdentity", (): unknown => ({
  useImportIdentity: jest.fn(),
}));

describe("ui/pages/ImportIdentity", () => {
  const defaultHookData: IUseImportIdentityData = {
    isLoading: false,
    errors: {},
    urlOrigin: mockDefaultIdentity.metadata.urlOrigin,
    trapdoor: mockDefaultIdentitySecret,
    nullifier: mockDefaultIdentitySecret,
    secret: mockDefaultIdentitySecret,
    commitment: mockDefaultIdentityCommitment,
    register: jest.fn(),
    onGoBack: jest.fn(),
    onGoToHost: jest.fn(),
    onDrop: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    (useImportIdentity as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <ImportIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("import-identity-page");

    expect(page).toBeInTheDocument();
  });

  test("should render empty state properly", async () => {
    (useImportIdentity as jest.Mock).mockReturnValue({
      ...defaultHookData,
      urlOrigin: "",
      faviconUrl: "",
    });

    const { container, findByTestId } = render(
      <Suspense>
        <ImportIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("import-identity-page");

    expect(page).toBeInTheDocument();
  });

  test("should render error state properly", async () => {
    (useImportIdentity as jest.Mock).mockReturnValue({ ...defaultHookData, errors: { root: "Error" } });

    const { container, findByText } = render(
      <Suspense>
        <ImportIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const error = await findByText("Error");

    expect(error).toBeInTheDocument();
  });
});
