export const mockJsonFile = new File([JSON.stringify({ ping: true })], "ping.json", { type: "application/json" });

export const mockIdenityJsonFile = new File([JSON.stringify({ trapdoor: "1", nullifier: "1" })], "identity.json", {
  type: "application/json",
});

export const mockArrayIdenityJsonFile = new File([JSON.stringify(["2", "2"])], "identity.json", {
  type: "application/json",
});

export const mockIdenityPrivateJsonFile = new File(
  [JSON.stringify({ _trapdoor: "3", _nullifier: "3" })],
  "identity.json",
  { type: "application/json" },
);

export const mockEmptyJsonFile = new File([""], "empty.json", { type: "application/json" });

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
