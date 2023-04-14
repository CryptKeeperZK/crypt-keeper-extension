import { formatDate } from "../date";

describe("util/date", () => {
  test("should format date properly", () => {
    const result = formatDate(new Date());

    expect(result).toBeDefined();
  });
});
