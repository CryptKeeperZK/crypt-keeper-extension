export function isDebugMode(): boolean {
  return process.env.CRYPTKEEPER_DEBUG === "true";
}
