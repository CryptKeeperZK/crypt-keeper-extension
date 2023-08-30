import fs from "fs";
import { promisify } from "util";

import type { BumpExecutorSchema } from "./schema";

export default async function runExecutor(options: BumpExecutorSchema): Promise<{ success: boolean }> {
  const { tag, manifestPaths } = options;
  const version = tag.split("-")[1];

  if (!version) {
    throw new Error(`Tag doesn't have the version. Tag: ${tag}.`);
  }

  if (manifestPaths.length === 0) {
    throw new Error("No manifest files are provided");
  }

  await Promise.all(manifestPaths.map((manifestPath) => writeManifestVersion(manifestPath, version)));

  return {
    success: true,
  };
}

async function writeManifestVersion(manifestPath: string, version: string): Promise<boolean> {
  const manifest = await readManifestFile(manifestPath);
  await promisify(fs.writeFile)(manifestPath, `${JSON.stringify({ ...manifest, version }, null, 2)}\n`);

  return true;
}

export async function readManifestFile(manifestPath: string): Promise<{ version: string }> {
  const manifest = await promisify(fs.readFile)(manifestPath, { encoding: "utf8" });

  return JSON.parse(manifest) as { version: string };
}
