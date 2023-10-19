/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";

import { IUploadButtonProps, UploadButton } from "..";
import { IUseUploadButtonData, useUploadButton } from "../useUploadButton";

jest.mock("../useUploadButton", (): unknown => ({
  ...jest.requireActual("../useUploadButton"),
  useUploadButton: jest.fn(),
}));

describe("ui/components/UploadButton", () => {
  const defaultHookData: IUseUploadButtonData = {
    isDragActive: false,
    acceptedFiles: [],
    getInputProps: jest.fn(),
    getRootProps: jest.fn(),
  };

  const defaultProps: IUploadButtonProps = {
    accept: { "application/json": [".json"] },
    name: "file",
    onDrop: jest.fn(),
  };

  beforeEach(() => {
    (useUploadButton as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { findByText } = render(<UploadButton {...defaultProps} />);

    const dragText = await findByText("Upload files");

    expect(dragText).toBeInTheDocument();
  });

  test("should render properly while drag is active", async () => {
    (useUploadButton as jest.Mock).mockReturnValue({ ...defaultHookData, isDragActive: true });

    const { findByText } = render(<UploadButton {...defaultProps} />);

    const dragText = await findByText("Drop the files here...");

    expect(dragText).toBeInTheDocument();
  });

  test("should render error properly", async () => {
    const { findByText } = render(<UploadButton {...defaultProps} errorMessage="error" />);

    const error = await findByText("error");

    expect(error).toBeInTheDocument();
  });
});
