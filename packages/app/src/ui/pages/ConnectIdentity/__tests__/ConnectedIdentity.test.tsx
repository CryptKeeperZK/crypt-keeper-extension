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
  useIdentities: jest.fn(),
}));

describe("ui/pages/ConnectIdentity", () => {
  const defaultHookData: IUseConnectIdentityData = {
    urlOrigin: "http://localhost:3000",
    faviconUrl: "",
    selectedTab: EConnectIdentityTabs.LINKED,
    selectedIdentityCommitment: "1234",
    identities: [
      {
        commitment: "1234",
        metadata: {
          account: ZERO_ADDRESS,
          name: "Account #1",
          groups: [],
          isDeterministic: true,
          isImported: false,
        },
      },
      {
        commitment: "4321",
        metadata: {
          account: ZERO_ADDRESS,
          name: "Account #2",
          groups: [],
          isDeterministic: true,
          isImported: false,
        },
      },
    ],
    connectedOrigins: {
      1234: "http://localhost:3000",
    },
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

  test("should render identities identity list properly", async () => {
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

    expect(defaultHookData.onConnect).toHaveBeenCalledTimes(1);
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

    expect(defaultHookData.onReject).toHaveBeenCalledTimes(1);
  });
});
