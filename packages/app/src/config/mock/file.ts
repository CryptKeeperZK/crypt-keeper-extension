export const mockJsonFile = new File([JSON.stringify({ ping: true })], "ping.json", { type: "application/json" });

interface IDataTransfer {
  dataTransfer: {
    files: File[];
    items: DataTransferItem[];
    types: string[];
  };
}

export const createDataTransfer = (files: File[]): IDataTransfer => ({
  dataTransfer: {
    files,
    items: files.map(
      (file) =>
        ({
          kind: "file",
          size: file.size,
          type: file.type,
          getAsFile: () => file,
        }) as unknown as DataTransferItem,
    ),
    types: ["Files"],
  },
});
