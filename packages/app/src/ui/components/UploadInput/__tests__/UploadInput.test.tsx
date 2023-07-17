/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";

import { mockJsonFile } from "@src/config/mock/file";

import { IUploadInputProps, UploadInput } from "..";
import { IUseUploadInputData, useUploadInput } from "../useUploadInput";

jest.mock("../useUploadInput", (): unknown => ({
  ...jest.requireActual("../useUploadInput"),
  useUploadInput: jest.fn(),
}));

describe("ui/components/UploadInput", () => {
  const defaultHookData: IUseUploadInputData = {
    isDragActive: false,
    acceptedFiles: [mockJsonFile],
    getInputProps: jest.fn(),
    getRootProps: jest.fn(),
  };

  const defaultProps: IUploadInputProps = {
    accept: { "application/json": [] },
    onDrop: jest.fn(),
  };

  beforeEach(() => {
    (useUploadInput as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { findByText } = render(<UploadInput {...defaultProps} />);

    const dragText = await findByText("Drop some files here, or click to select");
    const fileName = await findByText(/ping.json/);

    expect(dragText).toBeInTheDocument();
    expect(fileName).toBeInTheDocument();
  });

  test("should render properly while drag is active", async () => {
    (useUploadInput as jest.Mock).mockReturnValue({ ...defaultHookData, isDragActive: true });

    const { findByText } = render(<UploadInput {...defaultProps} />);

    const dragText = await findByText("Drop the files here...");

    expect(dragText).toBeInTheDocument();
  });

  test("should render error properly", async () => {
    const { findByText } = render(<UploadInput {...defaultProps} errorMessage="error" />);

    const error = await findByText("error");

    expect(error).toBeInTheDocument();
  });
});
