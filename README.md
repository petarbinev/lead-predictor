# LeadPredictor

A responsive campaign calculator built with **HTML, CSS, and vanilla JavaScript**. Enter a revenue goal to work backwards to the customers, leads, and prospects needed to reach it.

- **Website:** [lead-predictor-petarbinev.netlify.app](https://lead-predictor-petarbinev.netlify.app)
- **Repository:** [petarbinev/lead-predictor](https://github.com/petarbinev/lead-predictor)

## Run locally

Use Node.js 20 or newer. There are no package dependencies to install.

```sh
git clone https://github.com/petarbinev/lead-predictor.git
cd lead-predictor
npm start
```

Open <http://127.0.0.1:4173>. Run `npm test` for the calculation and timeline checks. Set `PORT` if you need a different local port. Any static web server can also serve `public/`; JavaScript modules require serving over HTTP rather than opening `index.html` as a local file.

## Features

- Dark, responsive interface based on the supplied assignment reference.
- Revenue, average order value, campaign dates, and two response-rate sliders.
- Immediate funnel totals, percentage cards, and a cumulative monthly SVG chart.
- Chart details available through pointer interaction, click/tap, or keyboard focus. Press Enter/Space to show a tooltip and Escape to dismiss it.
- An expandable table provides the same monthly figures as the chart.
- English and Bulgarian labels, validation, chart descriptions, dates, and numbers.
- USD/EUR units and locale-aware monetary formatting. Currency selection preserves the numeric inputs; it does not use exchange rates.
- Labeled controls, visible keyboard focus, validation messages, and a polite announcement of updated results.
- No backend, external fonts, runtime packages, tracking, or account requirement for visitors.

## Formulas and assumptions

```text
customers = ceil(revenue / average order value)
leads     = ceil(customers × 100 / lead response rate)
prospects = ceil(leads × 100 / prospect response rate)
```

Each stage rounds upward to a whole person before the next stage is calculated. Monetary input uses integer cents and the divisions use `BigInt`, avoiding floating-point over-rounding. Inputs accept up to two decimal places. Counts must stay within JavaScript's safe integer range.

With revenue **10,000**, average order **1,000**, lead response **40%**, and prospect response **20%**, the result is **10 customers, 25 leads, and 125 prospects**. The summary percentages compare every group to all prospects: **8%, 20%, and 100%**. The 40% slider measures leads becoming customers, which has a different denominator from the customer card.

Zero revenue gives zero counts and 0% on all cards. Order value must be greater than zero. Response-rate sliders use whole percentages from 1 to 100. Invalid inputs clear the result and chart instead of leaving a stale estimate visible.

The timeline assumes steady cumulative progress over the selected calendar days. It adds a point at each monthly anniversary of the start, clamping to the month's last valid day, and includes the campaign end as the last point. January 31 therefore advances to February 28 (29 in a leap year), then March 31. Partial final months are included, and the last point exactly matches the cards. The month count includes a partial month; the adjacent day count shows the actual duration. Date changes alter the timeline, not the total funnel requirements. Dates are handled at UTC midnight to avoid daylight-saving drift. Campaigns are limited to 10 years to keep the monthly chart usable; past dates are allowed.

The bars overlap from the same zero origin because leads and customers are subsets of prospects. They are not added together.

## Project structure

```text
public/
  index.html          Semantic page and form
  favicon.svg         Funnel brand icon
  css/styles.css      Layout, controls, cards, chart, breakpoints
  js/app.js           Input handling and rendering
  js/calculator.js    Validation and exact funnel calculations
  js/chart.js         Monthly allocation, SVG chart, data table
  js/i18n.js          English/Bulgarian translations
tests/                Node's built-in test runner
scripts/serve.js       Dependency-free local static server
netlify.toml          Static publish directory and response headers
IMPLEMENTATION_PLAN.md
```

## Assignment history

Each development stage entered `main` through a pull request using a merge commit. Seven additional remote branches are retained, and automatic branch deletion is disabled. The initial plan/setup commit establishes the repository and is not counted toward the five meaningful development commits.

| Branch | Pull request | Work |
| --- | --- | --- |
| `feature/page-layout` | [#1](https://github.com/petarbinev/lead-predictor/pull/1) | Responsive HTML/CSS layout and static server |
| `feature/calculator` | [#2](https://github.com/petarbinev/lead-predictor/pull/2) | Exact calculations, validation, tests |
| `feature/campaign-chart` | [#3](https://github.com/petarbinev/lead-predictor/pull/3) | SVG chart, monthly allocation, timeline tests |
| `feature/preferences` | [#4](https://github.com/petarbinev/lead-predictor/pull/4) | English/Bulgarian and USD/EUR |
| `experiment/chart-animation` | [#5](https://github.com/petarbinev/lead-predictor/pull/5) | Isolated chart animation experiment |
| `revert/chart-animation` | [#6](https://github.com/petarbinev/lead-predictor/pull/6) | Explicit reversal using `git revert` |
| `chore/release-documentation` | Release PR | Small-phone fixes, readable formatting, documentation, final checks |

The [animation commit](https://github.com/petarbinev/lead-predictor/commit/c36eca8) adds a 350ms entrance effect. During evaluation, it restarted on every slider adjustment, delaying the stable view of the new targets. The [revert commit](https://github.com/petarbinev/lead-predictor/commit/2164fe4) restores immediate updates. Both remain in history; no history rewrite was used.

## Verification

The 16 automated tests cover the reference example, upward rounding, decimal money, zero targets, 1%/100% rates, malformed inputs, unsafe totals, date order, campaign limits, partial months, leap years, month-end anniversaries, monotonic nested populations, and final totals.

Browser checks cover live recalculation, invalid-field clearing, currency changes, Bulgarian translations, Enter/Escape chart tooltips, slider keyboard endpoints, invalid dates, and layouts at 320px, 390px, 768px, and desktop width. The 320px Bulgarian check identified card-label overlap, corrected by placing the percentage below the label. These are browser checks; no physical-device or full assistive-technology audit is claimed.

## Deployment

Netlify serves **`public/`** with **no build command**. The project uses the owner's existing Netlify account and the connected deployment tool. This is a manual publication of the repository's code; GitHub continuous deployment and automatic PR previews are not configured. Future edits require a new deployment.

To enable continuous deployment later, link this existing Netlify project to `petarbinev/lead-predictor`, choose `main`, set the publish directory to `public`, and leave the build command empty. The same settings are already recorded in `netlify.toml`.

Never commit deployment credentials, `.env` files, or the `.netlify` directory. Authentication details are not part of this project.
