/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import { bigintToHex } from "bigint-conversion";

import { mockDefaultIdentitySecret, mockDefaultIdentitySecretHex } from "@src/config/mock/zk";
import { ellipsify } from "@src/util/account";

import { IBigNumberInputProps, BigNumberInput } from "../BigNumberInput";
import { IUseBigNumberInputData, useBigNumberInput } from "../useBigNumberInput";

jest.mock("bigint-conversion", (): unknown => ({
  bigintToHex: jest.fn(),
}));

jest.mock("../useBigNumberInput", (): unknown => ({
  useBigNumberInput: jest.fn(),
}));

describe("ui/components/BigNumberInput", () => {
  const defaultProps: IBigNumberInputProps = {
    label: "Label",
    value: mockDefaultIdentitySecret,
    variant: "filled",
  };

  const defaultHookData: IUseBigNumberInputData = {
    isFocused: false,
    isInitialized: true,
    isHex: false,
    onBlur: jest.fn(),
    onFocus: jest.fn(),
    onToggleHex: jest.fn(),
  };

  beforeEach(() => {
    (bigintToHex as jest.Mock).mockReturnValue(mockDefaultIdentitySecretHex);

    (useBigNumberInput as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render focused state properly", async () => {
    (useBigNumberInput as jest.Mock).mockReturnValue({ ...defaultHookData, isFocused: true, isInitialized: false });

    const { findByText, findByDisplayValue } = render(<BigNumberInput {...defaultProps} />);

    const label = await findByText(defaultProps.label);
    const hex = await findByText("Hex");
    const value = await findByDisplayValue(mockDefaultIdentitySecret);

    expect(label).toBeInTheDocument();
    expect(hex).toBeInTheDocument();
    expect(value).toBeInTheDocument();
  });

  test("should render dec properly", async () => {
    const { findByText, findByDisplayValue } = render(<BigNumberInput {...defaultProps} />);

    const label = await findByText(defaultProps.label);
    const hex = await findByText("Hex");
    const value = await findByDisplayValue(ellipsify(mockDefaultIdentitySecret));

    expect(label).toBeInTheDocument();
    expect(hex).toBeInTheDocument();
    expect(value).toBeInTheDocument();
  });

  test("should render hex properly", async () => {
    (useBigNumberInput as jest.Mock).mockReturnValue({ ...defaultHookData, isHex: true });

    const { findByText, findByDisplayValue } = render(<BigNumberInput {...defaultProps} />);

    const label = await findByText(defaultProps.label);
    const hex = await findByText("Dec");
    const value = await findByDisplayValue(ellipsify(mockDefaultIdentitySecretHex));

    expect(label).toBeInTheDocument();
    expect(hex).toBeInTheDocument();
    expect(value).toBeInTheDocument();
  });
});
