import Handler from "../handler";

describe("background/controllers/handler", () => {
  test("should add handler method properly and process it", async () => {
    const handler = new Handler();

    handler.add(
      "counter",
      (count: number) => count + 1,
      (count: number) => count + 2,
      (count: number) => count + 3,
      (count: number) => count + 4,
    );

    const result = await handler.handle({ method: "counter", payload: 0 });

    expect(result).toBe(10);
  });

  test("should throw error if there is no registered method", () => {
    const handler = new Handler();

    expect(handler.handle({ method: "unknown" })).rejects.toThrowError("method: unknown is not detected");
  });
});
