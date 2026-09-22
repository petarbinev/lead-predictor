import test from "node:test";
import assert from "node:assert/strict";
import { campaignTimeline } from "../public/js/chart.js";
import { parseDate } from "../public/js/calculator.js";

const counts = { prospects: 125, leads: 25, customers: 10 };
const timeline = (start, end, totals = counts) =>
  campaignTimeline(parseDate(start), parseDate(end), totals);
const dates = (periods) =>
  periods.map((period) => period.date.toISOString().slice(0, 10));

test("reference campaign has six monthly points and exact final totals", () => {
  const periods = timeline("2026-05-08", "2026-11-04");
  assert.deepEqual(dates(periods), [
    "2026-06-08",
    "2026-07-08",
    "2026-08-08",
    "2026-09-08",
    "2026-10-08",
    "2026-11-04",
  ]);
  assert.deepEqual(periods.at(-1).counts, counts);
  assert.deepEqual(periods[0].counts, {
    prospects: 22,
    leads: 5,
    customers: 2,
  });
});
test("short campaigns have one point and exact-month campaigns have no duplicate", () => {
  assert.deepEqual(dates(timeline("2026-05-08", "2026-05-09")), ["2026-05-09"]);
  assert.deepEqual(dates(timeline("2026-05-08", "2026-06-08")), ["2026-06-08"]);
});
test("month-end anniversaries do not drift after February", () => {
  assert.deepEqual(dates(timeline("2026-01-31", "2026-04-30")), [
    "2026-02-28",
    "2026-03-31",
    "2026-04-30",
  ]);
  assert.deepEqual(dates(timeline("2024-01-31", "2024-03-31")), [
    "2024-02-29",
    "2024-03-31",
  ]);
});
test("leap-day and daylight-saving periods use consistent calendar-day allocation", () => {
  assert.deepEqual(dates(timeline("2024-02-29", "2024-05-29")), [
    "2024-03-29",
    "2024-04-29",
    "2024-05-29",
  ]);
  assert.deepEqual(
    timeline("2026-03-01", "2026-05-01", {
      prospects: 61,
      leads: 61,
      customers: 61,
    })[0].counts,
    { prospects: 31, leads: 31, customers: 31 },
  );
});
test("cumulative targets remain nested and monotonic", () => {
  const periods = timeline("2026-01-01", "2036-01-01");
  assert.equal(periods.length, 120);
  let previous = { prospects: 0, leads: 0, customers: 0 };
  for (const { counts: current } of periods) {
    assert.ok(
      current.prospects >= current.leads && current.leads >= current.customers,
    );
    for (const key of Object.keys(counts))
      assert.ok(current[key] >= previous[key] && current[key] <= counts[key]);
    previous = current;
  }
});
test("zero targets stay zero and invalid date ranges have no timeline", () => {
  assert.deepEqual(
    timeline("2026-01-01", "2026-03-01", {
      prospects: 0,
      leads: 0,
      customers: 0,
    })[0].counts,
    { prospects: 0, leads: 0, customers: 0 },
  );
  assert.deepEqual(timeline("2026-03-01", "2026-01-01"), []);
  assert.deepEqual(
    campaignTimeline(new Date("invalid"), new Date(), counts),
    [],
  );
});
test("very large valid targets preserve exact final totals", () => {
  const large = {
    prospects: Number.MAX_SAFE_INTEGER,
    leads: 100000,
    customers: 900,
  };
  assert.deepEqual(
    timeline("2026-01-01", "2026-03-01", large).at(-1).counts,
    large,
  );
});
