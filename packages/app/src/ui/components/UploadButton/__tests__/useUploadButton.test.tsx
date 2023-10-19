/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, renderHook } from "@testing-library/react";

import { createDataTransfer, mockJsonFile } from "@src/config/mock/file";

import { IUseUploadButtonArgs, useUploadButton } from "../useUploadButton";

describe("ui/components/UploadButton/useUploadButton", () => {
  const defaultHookArgs: IUseUploadButtonArgs = {
    isLoading: false,
    accept: { "application/json": [".json"] },
    onDrop: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should upload file properly", async () => {
    const data = createDataTransfer([mockJsonFile]);

    const { result } = renderHook(() => useUploadButton(defaultHookArgs));

    const { container } = render(
      <div {...result.current.getRootProps()}>
        <input {...result.current.getInputProps()} />
      </div>,
    );

    await act(() => fireEvent.drop(container.querySelector("div")!, data));

    expect(defaultHookArgs.onDrop).toBeCalledTimes(1);
  });
});
