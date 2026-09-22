const DAY = 86400000;
const keys = ["prospects", "leads", "customers"];
const defaults = {
  month: "Month",
  people: "People",
  prospects: "Prospects",
  leads: "Leads",
  customers: "Customers",
  chartLabel: "Cumulative campaign targets",
  chartInvalid: "Complete the campaign details to see your timeline.",
};

export function campaignTimeline(start, end, counts) {
  if (
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    !Number.isFinite(+start) ||
    !Number.isFinite(+end) ||
    end <= start
  )
    return [];
  const periods = [];
  const duration = BigInt(Math.round((end - start) / DAY));
  for (let month = 1; month <= 121; month++) {
    // Always advance from the original start, so January 31 → February 28 → March 31.
    const anniversary = new Date(start);
    anniversary.setUTCDate(1);
    anniversary.setUTCMonth(start.getUTCMonth() + month);
    const lastDay = new Date(anniversary);
    lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);
    anniversary.setUTCDate(Math.min(start.getUTCDate(), lastDay.getUTCDate()));
    const date = anniversary < end ? anniversary : new Date(end);
    const elapsed = BigInt(Math.round((date - start) / DAY));
    const cumulative = Object.fromEntries(
      keys.map((key) => [
        key,
        Number((BigInt(counts[key]) * elapsed + duration - 1n) / duration),
      ]),
    );
    periods.push({ month, date, counts: cumulative });
    if (+date === +end) break;
  }
  return periods;
}

function svgElement(name, attributes, text) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes))
    element.setAttribute(key, String(value));
  if (text !== undefined) element.textContent = text;
  return element;
}

export function renderChart(container, tableBody, periods, options = {}) {
  const labels = { ...defaults, ...options.labels };
  const locale = options.locale || "en-US";
  const number = new Intl.NumberFormat(locale);
  const compactNumber = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const dateFormat = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  container.replaceChildren();
  tableBody.replaceChildren();
  if (!periods.length) {
    const empty = document.createElement("p");
    empty.className = "empty-chart";
    empty.textContent = labels.chartInvalid;
    container.append(empty);
    return;
  }

  const width = Math.max(280, Math.floor(container.clientWidth));
  const height = Math.max(330, periods.length * 51 + 57);
  const left = 32;
  const right = 25;
  const top = 26;
  const bottom = height - 42;
  const plotWidth = width - left - right;
  const rowHeight = (bottom - top) / periods.length;
  const max = Math.max(1, periods.at(-1).counts.prospects);
  const rawStep = max / (width < 380 ? 3 : 5);
  const power = 10 ** Math.floor(Math.log10(rawStep));
  const step = Math.max(
    1,
    [1, 2, 5, 10].find((value) => value * power >= rawStep) * power,
  );
  const scaleMax = Math.ceil(max / step) * step;
  const scale = (value) => (value / scaleMax) * plotWidth;
  const svg = svgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    role: "group",
    "aria-label": labels.chartLabel,
    class: "campaign-chart",
  });
  svg.append(
    svgElement(
      "text",
      { x: 2, y: 13, class: "chart-axis-title" },
      labels.month,
    ),
  );
  for (let tick = 0; tick <= scaleMax; tick += step) {
    const x = left + scale(tick);
    svg.append(
      svgElement("line", {
        x1: x,
        x2: x,
        y1: top,
        y2: bottom,
        class: "chart-grid",
      }),
    );
    svg.append(
      svgElement(
        "text",
        { x, y: bottom + 19, "text-anchor": "middle", class: "chart-tick" },
        compactNumber.format(tick),
      ),
    );
  }
  svg.append(
    svgElement(
      "text",
      {
        x: left + plotWidth / 2,
        y: height - 4,
        "text-anchor": "middle",
        class: "chart-axis-title",
      },
      labels.people,
    ),
  );

  const tooltip = document.createElement("div");
  tooltip.id = "chart-tooltip";
  tooltip.className = "chart-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  let active;

  periods.forEach((period, index) => {
    const y = top + index * rowHeight;
    const barHeight = Math.min(rowHeight - 9, 43);
    const date = dateFormat.format(period.date);
    const description = `${labels.month} ${period.month} · ${date}. ${keys.map((key) => `${labels[key]}: ${number.format(period.counts[key])}`).join(", ")}.`;
    const group = svgElement("g", {
      tabindex: 0,
      role: "button",
      "aria-label": description,
      class: "chart-row",
    });
    group.append(
      svgElement("rect", {
        x: 0,
        y,
        width,
        height: rowHeight,
        fill: "transparent",
        class: "chart-hit-area",
      }),
    );
    group.append(
      svgElement(
        "text",
        {
          x: 14,
          y: y + barHeight / 2 + 4,
          "text-anchor": "middle",
          class: "chart-tick",
        },
        period.month,
      ),
    );
    for (const key of keys)
      group.append(
        svgElement("rect", {
          x: left,
          y: y + 2,
          width: scale(period.counts[key]),
          height: barHeight,
          rx: 2,
          class: `chart-bar chart-bar-${key}`,
        }),
      );
    const show = () => {
      active?.classList.remove("is-active");
      active = group;
      group.classList.add("is-active");
      tooltip.replaceChildren();
      const title = document.createElement("strong");
      title.textContent = `${labels.month} ${period.month} · ${date}`;
      tooltip.append(title);
      for (const key of keys) {
        const line = document.createElement("span");
        line.textContent = `${labels[key]}: ${number.format(period.counts[key])}`;
        tooltip.append(line);
      }
      tooltip.style.top = `${Math.max(0, y - 8)}px`;
      tooltip.hidden = false;
    };
    const hide = () => {
      group.classList.remove("is-active");
      tooltip.hidden = true;
    };
    group.addEventListener("pointerenter", show);
    group.addEventListener("pointerleave", hide);
    group.addEventListener("focus", show);
    group.addEventListener("blur", hide);
    group.addEventListener("click", show);
    group.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hide();
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        show();
      }
    });
    svg.append(group);

    const row = document.createElement("tr");
    const heading = document.createElement("th");
    heading.scope = "row";
    heading.textContent = `${labels.month} ${period.month} · ${date}`;
    row.append(heading);
    for (const key of keys) {
      const cell = document.createElement("td");
      cell.textContent = number.format(period.counts[key]);
      row.append(cell);
    }
    tableBody.append(row);
  });
  container.append(svg, tooltip);
}
