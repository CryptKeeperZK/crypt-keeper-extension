import checkParameter from "../checkParameter";

describe("util/checkParameter", () => {
  test("should throw error if there is a type mismatch", () => {
    expect(() => checkParameter("", "maybeBoolean", "boolean")).toThrow("Parameter 'maybeBoolean' is not a boolean");
    expect(() => checkParameter(new Function(), "maybeNumber", "number")).toThrow(
      "Parameter 'maybeNumber' is not a number",
    );
    expect(() => checkParameter(false, "maybeString", "string")).toThrow("Parameter 'maybeString' is not a string");
    expect(() => checkParameter("", "maybeObject", "object")).toThrow("Parameter 'maybeObject' is not an object");
    expect(() => checkParameter({}, "maybeFunction", "function")).toThrow(
      "Parameter 'maybeFunction' is not a function",
    );
  });

  test("should throw error if there is an undefined value", () => {
    expect(() => checkParameter(undefined, "empty", "string")).toThrow("Parameter 'empty' is not defined");
  });
});
