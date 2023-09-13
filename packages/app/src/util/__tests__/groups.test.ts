import { getBandadaUrl } from "@src/config/env";

import { getBandadaGroupUrl } from "../groups";

describe("util/groups", () => {
  test("should get bandada group url", () => {
    expect(getBandadaGroupUrl("id")).toBe(`${getBandadaUrl()}/groups/off-chain/id`);
    expect(getBandadaGroupUrl("id", "on-chain")).toBe(`${getBandadaUrl()}/groups/on-chain/id`);
  });
});
