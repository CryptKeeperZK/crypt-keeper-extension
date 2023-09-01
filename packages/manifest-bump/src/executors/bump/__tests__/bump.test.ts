import path from "path";

import type { BumpExecutorSchema } from "../schema";

import executor, { readManifestFile } from "../executor";

describe("executors/bump", () => {
  const defaultOptions: BumpExecutorSchema = {
    tag: "@cryptkeeperzk/app-0.0.1",
    manifestPaths: [
      path.resolve(__dirname, "../mocks/v2/manifest.firefox.json"),
      path.resolve(__dirname, "../mocks/v3/manifest.firefox.json"),
      path.resolve(__dirname, "../mocks/v3/manifest.chrome.json"),
    ],
  };

  afterEach(async () => {
    await executor({ ...defaultOptions, tag: "@cryptkeeperzk/app-0.2.4" });
  });

  test("should update manifest versions successfully", async () => {
    const newVersion = "0.0.1";

    const output = await executor(defaultOptions);
    const manifests = await Promise.all(
      defaultOptions.manifestPaths.map((manifestPath) => readManifestFile(manifestPath)),
    );
    const versions = manifests.map(({ version }) => version);

    expect(versions).toStrictEqual([newVersion, newVersion, newVersion]);
    expect(output.success).toBe(true);
  });

  test("should throw error if there is no version in tag", async () => {
    await expect(executor({ ...defaultOptions, tag: "tag" })).rejects.toThrow(
      "Tag doesn't have the version. Tag: tag.",
    );
  });

  test("should throw error if there is an empty array of manifest files", async () => {
    await expect(executor({ ...defaultOptions, manifestPaths: [] })).rejects.toThrow("No manifest files are provided");
  });
});
