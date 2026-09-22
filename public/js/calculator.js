const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

// Integer cents and integer division avoid floating-point over-rounding.
function moneyToCents(value) {
  const text = String(value ?? "").trim();
  if (!/^(?:\d+|\d*\.\d{1,2})$/.test(text) || text.length > 20) return null;
  const [whole, fraction = ""] = text.split(".");
  const cents = BigInt(whole || "0") * 100n + BigInt(fraction.padEnd(2, "0"));
  return cents <= MAX_SAFE ? cents : null;
}

export function parseDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000")
  )
    return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? date
    : null;
}

function ceilDivide(numerator, denominator) {
  return (numerator + denominator - 1n) / denominator;
}

export function calculateCampaign(input) {
  const errors = {};
  const revenue = moneyToCents(input.revenue);
  const orderValue = moneyToCents(input.orderValue);
  const leadRate = Number(input.leadRate);
  const prospectRate = Number(input.prospectRate);
  const start = parseDate(input.startDate);
  const end = parseDate(input.endDate);

  if (revenue === null) errors.revenue = "invalidRevenue";
  if (orderValue === null || orderValue === 0n)
    errors.orderValue = "invalidOrder";
  if (!Number.isInteger(leadRate) || leadRate < 1 || leadRate > 100)
    errors.leadRate = "invalidRate";
  if (!Number.isInteger(prospectRate) || prospectRate < 1 || prospectRate > 100)
    errors.prospectRate = "invalidRate";
  if (!start) errors.startDate = "invalidDate";
  if (!end) errors.endDate = "invalidDate";
  if (start && end) {
    if (end <= start) errors.endDate = "invalidDateOrder";
    const tenYearsLater = new Date(start);
    tenYearsLater.setUTCFullYear(start.getUTCFullYear() + 10);
    if (end > tenYearsLater) errors.endDate = "campaignTooLong";
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  const customers = ceilDivide(revenue, orderValue);
  const leads = ceilDivide(customers * 100n, BigInt(leadRate));
  const prospects = ceilDivide(leads * 100n, BigInt(prospectRate));
  if (prospects > MAX_SAFE)
    return { ok: false, errors: { revenue: "tooLarge" } };

  const counts = {
    prospects: Number(prospects),
    leads: Number(leads),
    customers: Number(customers),
  };
  const shares = Object.fromEntries(
    Object.entries(counts).map(([key, count]) => [
      key,
      prospects ? (count / counts.prospects) * 100 : 0,
    ]),
  );
  return {
    ok: true,
    counts,
    shares,
    start,
    end,
    revenue: Number(revenue) / 100,
  };
}
