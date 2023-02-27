export default function checkParameter(
  value: unknown,
  name: string,
  type: "boolean" | "number" | "string" | "object" | "function",
) {
  if (value === undefined) {
    throw new TypeError(`Parameter '${name}' is not defined`);
  }

  if (typeof value !== type) {
    throw new TypeError(`Parameter '${name}' is not ${type === "object" ? "an" : "a"} ${type}`);
  }
}
