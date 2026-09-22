import test from "node:test";
import assert from "node:assert/strict";
import { calculateCampaign, parseDate } from "../public/js/calculator.js";

const base = {
  revenue: "10000",
  orderValue: "1000",
  leadRate: "40",
  prospectRate: "20",
  startDate: "2026-05-08",
  endDate: "2026-11-04",
};
const calculate = (overrides) => calculateCampaign({ ...base, ...overrides });

test("reference example matches all three counts and card percentages", () => {
  const result = calculate();
  assert.equal(result.ok, true);
  assert.deepEqual(result.counts, { prospects: 125, leads: 25, customers: 10 });
  assert.deepEqual(result.shares, { prospects: 100, leads: 20, customers: 8 });
});
test("rounds upward at each funnel stage", () => {
  assert.deepEqual(calculate({ revenue: "10001" }).counts, {
    prospects: 140,
    leads: 28,
    customers: 11,
  });
});
test("handles decimal money exactly without phantom customers", () => {
  assert.deepEqual(
    calculate({
      revenue: "0.07",
      orderValue: "0.01",
      leadRate: "100",
      prospectRate: "100",
    }).counts,
    { prospects: 7, leads: 7, customers: 7 },
  );
  assert.equal(
    calculate({ revenue: ".30", orderValue: ".10" }).counts.customers,
    3,
  );
});
test("zero target returns zero counts and shares", () => {
  const result = calculate({ revenue: "0" });
  assert.deepEqual(result.counts, { prospects: 0, leads: 0, customers: 0 });
  assert.deepEqual(result.shares, { prospects: 0, leads: 0, customers: 0 });
});
test("rates at either endpoint produce correct required populations", () => {
  assert.deepEqual(calculate({ leadRate: "100", prospectRate: "100" }).counts, {
    prospects: 10,
    leads: 10,
    customers: 10,
  });
  assert.deepEqual(calculate({ leadRate: "1", prospectRate: "1" }).counts, {
    prospects: 100000,
    leads: 1000,
    customers: 10,
  });
});
test("rejects missing, negative, malformed and oversized monetary values", () => {
  for (const revenue of [
    "",
    "-1",
    "Infinity",
    "NaN",
    "1.001",
    "1e309",
    "9999999999999999999999999",
  ])
    assert.equal(calculate({ revenue }).ok, false, revenue);
  for (const orderValue of ["", "0", "-2", "Infinity"])
    assert.equal(calculate({ orderValue }).ok, false, orderValue);
  assert.equal(
    calculate({
      revenue: "90071992547409.91",
      orderValue: ".01",
      leadRate: "1",
      prospectRate: "1",
    }).errors.revenue,
    "tooLarge",
  );
});
test("validates response rates even when the UI normally constrains them", () => {
  for (const rate of ["", 0, -1, 101, 2.5, Infinity, "abc"]) {
    assert.equal(calculate({ leadRate: rate }).ok, false);
    assert.equal(calculate({ prospectRate: rate }).ok, false);
  }
});
test("rejects missing, impossible, reversed and excessively long dates", () => {
  for (const startDate of ["", "2026-02-30", "0000-01-01", "2026-11-05"])
    assert.equal(calculate({ startDate }).ok, false);
  assert.equal(calculate({ endDate: base.startDate }).ok, false);
  assert.equal(
    calculate({ endDate: "2036-05-09" }).errors.endDate,
    "campaignTooLong",
  );
  assert.equal(calculate({ endDate: "2036-05-08" }).ok, true);
  assert.equal(
    parseDate("2024-02-29").toISOString(),
    "2024-02-29T00:00:00.000Z",
  );
});
test("increasing response rates cannot increase outreach requirements", () => {
  let previous = Infinity;
  for (let rate = 1; rate <= 100; rate++) {
    const result = calculate({ leadRate: rate, prospectRate: rate });
    assert.ok(result.counts.prospects <= previous);
    assert.ok(
      result.counts.prospects >= result.counts.leads &&
        result.counts.leads >= result.counts.customers,
    );
    previous = result.counts.prospects;
  }
});
