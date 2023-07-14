/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, renderHook } from "@testing-library/react";

import { createDataTransfer, mockJsonFile } from "@src/config/mock/file";

import { IUseUploadInputArgs, useUploadInput } from "../useUploadInput";

describe("ui/components/UploadInput/useUploadInput", () => {
  const defaultHookArgs: IUseUploadInputArgs = {
    isLoading: false,
    accept: { "application/json": [] },
    onDrop: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should upload file properly", async () => {
    const data = createDataTransfer([mockJsonFile]);

    const { result } = renderHook(() => useUploadInput(defaultHookArgs));

    const { container } = render(
      <div {...result.current.getRootProps()}>
        <input {...result.current.getInputProps()} />
      </div>,
    );

    await act(() => fireEvent.drop(container.querySelector("div")!, data));

    expect(defaultHookArgs.onDrop).toBeCalledTimes(1);
  });
});
