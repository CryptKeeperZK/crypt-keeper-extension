/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { mockDefaultIdentity } from "@src/config/mock/zk";

import ImportIdentity from "..";
import { IUseImportIdentityData, useImportIdentity } from "../useImportIdentity";

jest.mock("../useImportIdentity", (): unknown => ({
  useImportIdentity: jest.fn(),
}));

describe("ui/pages/ImportIdentity", () => {
  const defaultHookData: IUseImportIdentityData = {
    error: "",
    urlOrigin: mockDefaultIdentity.metadata.urlOrigin,
    faviconUrl: "http://localhost:3000/favicon.ico",
    serializedIdentity: "{}",
    serializedIdentityTooltip: "{}",
    onGoBack: jest.fn(),
    onGoToHost: jest.fn(),
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
      serializedIdentity: "",
      serializedIdentityTooltip: "",
      faviconUrl: "",
    });

    const { container, findByText } = render(
      <Suspense>
        <ImportIdentity />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const emptyText = await findByText("Invalid import params");
    expect(emptyText).toBeInTheDocument();
  });

  test("should render error state properly", async () => {
    (useImportIdentity as jest.Mock).mockReturnValue({ ...defaultHookData, error: "Error" });

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
