/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import ConnectIdentity from "..";
import { EConnectIdentityTabs, IUseConnectIdentityData, useConnectIdentity } from "../useConnectIdentity";

jest.mock("../useConnectIdentity", (): unknown => ({
  ...jest.requireActual("../useConnectIdentity"),
  useConnectIdentity: jest.fn(),
}));

describe("ui/pages/ConnectIdentity", () => {
  const defaultHookData: IUseConnectIdentityData = {
    host: "http://localhost:3000",
    faviconUrl: "",
    selectedTab: EConnectIdentityTabs.LINKED,
    isShowTabs: true,
    linkedIdentities: [
      {
        commitment: "1234",
        metadata: {
          identityStrategy: "random",
          account: ZERO_ADDRESS,
          name: "Account #1",
          groups: [],
          host: "http://localhost:3000",
        },
      },
    ],
    unlinkedIdentities: [
      {
        commitment: "4321",
        metadata: {
          identityStrategy: "random",
          account: ZERO_ADDRESS,
          name: "Account #2",
          groups: [],
        },
      },
    ],
    onSelectIdentity: jest.fn(),
    onTabChange: jest.fn(),
    onReject: jest.fn(),
    onConnect: jest.fn(),
  };

  beforeEach(() => {
    (useConnectIdentity as jest.Mock).mockReturnValue(defaultHookData);

    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render linked identity list properly", async () => {
    const { container, findByTestId } = render(
      <MemoryRouter>
        <ConnectIdentity />
      </MemoryRouter>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("connect-identity-page");

    expect(page).toBeInTheDocument();
  });

  test("should render unlinked identity list properly", async () => {
    (useConnectIdentity as jest.Mock).mockReturnValue({
      ...defaultHookData,
      selectedTab: EConnectIdentityTabs.UNLINKED,
    });

    const { container, findByTestId } = render(
      <MemoryRouter>
        <ConnectIdentity />
      </MemoryRouter>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("connect-identity-page");

    expect(page).toBeInTheDocument();
  });

  test("should accept connection properly", async () => {
    const { container, findByText } = render(
      <MemoryRouter>
        <ConnectIdentity />
      </MemoryRouter>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByText("Connect");
    await act(() => Promise.resolve(button.click()));

    expect(defaultHookData.onConnect).toBeCalledTimes(1);
  });

  test("should reject connection properly", async () => {
    const { container, findByText } = render(
      <MemoryRouter>
        <ConnectIdentity />
      </MemoryRouter>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByText("Reject");
    await act(() => Promise.resolve(button.click()));

    expect(defaultHookData.onReject).toBeCalledTimes(1);
  });
});
