# LeadPredictor implementation plan

Status: implementation started on 22 September 2026. See README.md for the final verification results and submission links.

The user requested this plan and then authorized implementation. The attached Bulgarian assignment supplies acceptance criteria and the second screenshot supplies the visual reference.

## 1. Assignment requirements

- Recreate a functioning calculator that visually resembles the reference; pixel-perfect reproduction is unnecessary.
- Create a new public GitHub repository.
- Include at least five meaningful commits, with development changes integrated through pull requests.
- Maintain at least five branches besides `main`.
- Include at least one actual reverted commit.
- Publish the finished site on Netlify, publicly accessible online.

Use the proposed repository name `lead-predictor`, subject to availability. The workspace was initially empty and had no Git repository.

## 2. Page and interaction design

Build a responsive single-page calculator using semantic HTML, CSS Grid/Flexbox, and vanilla JavaScript. Use a small inline SVG logo and icons, and render the chart as SVG. The site needs no backend, database, framework, or external chart dependency.

Match the reference's dark navy background, rounded panels, light text, horizontal chart, three summary cards, and two response-rate sliders. Improve text and focus contrast where necessary.

Desktop layout:

- Left: LeadPredictor branding and a form containing language, currency, campaign start/end, target revenue, and average order value.
- Upper right: cumulative campaign chart, alongside Prospects, Leads, and Customers cards.
- Lower right: lead response rate and prospect response rate sliders, each with a visible percentage.

On tablets, move the cards below the chart when space is limited. On phones, stack the form, cards, chart, and sliders without horizontal page scrolling.

Every valid input change updates the results immediately. Use real labels, keyboard-operable controls, visible focus, field-specific validation messages, and an accessible text/table equivalent for the chart. Tooltips must work with keyboard focus and touch as well as hover.

Proposed defaults reproduce the reference: English, USD, 8 May 2026–4 November 2026, revenue 10,000, average order value 1,000, lead response 40%, and prospect response 20%. Past campaign dates remain valid because this is a planning calculator.

## 3. Calculation rules

Interpret the labels using the assignment's formulas:

```text
customers = target revenue / average order value
leads = customers × 100 / lead response rate
prospects = leads × 100 / prospect response rate
```

Proposed rounding policy: use `Math.ceil` at each stage, feeding the rounded requirement into the next stage. This produces whole-person targets sufficient to meet the revenue goal. This is an explicit implementation assumption; rounding is not specified in the assignment.

Reference example:

```text
customers = ceil(10000 / 1000) = 10
leads = ceil(10 × 100 / 40) = 25
prospects = ceil(25 × 100 / 20) = 125
```

Card percentages and progress bars are shares of the total prospects:

- Prospects: 100%.
- Leads: 25 / 125 = 20%.
- Customers: 10 / 125 = 8%.

The 40% slider is the conversion from leads to customers. The customer card's 8% measures customers against all prospects. Calculate card percentages from the actual displayed counts after rounding.

Validation:

- Revenue must be finite and nonnegative; average order value must be finite and greater than zero.
- Response rates must be greater than zero and at most 100%; proposed sliders use 1–100% in steps of 1%.
- Dates must be valid and campaign end must be after campaign start.
- Blank or invalid inputs show a helpful error and an unavailable result state; do not display stale results as current or expose `NaN`/`Infinity`.
- Zero revenue produces zero counts and 0% card bars, avoiding division by zero.
- Reject results beyond JavaScript's safe integer range. Handle decimal currency inputs without rounding artifacts.

## 4. Chart and preferences

The assignment does not specify how to distribute targets over time. Assume steady progress across the selected duration and state this in the interface and README.

Use horizontal overlapping bars with a common zero origin for prospects, leads, and customers. These are nested funnel populations, so the bars must not add the three counts together. Include a legend, readable axis ticks, and tooltips containing the period and all three cumulative counts.

Create points at monthly anniversaries of the campaign start, followed by the campaign end if it is a partial month. Clamp dates to the last valid day of short months, calculating each anniversary from the original start date. For the reference dates this produces six points. Allocate cumulative targets in proportion to elapsed calendar days, round displayed counts upward, and make the final point exactly equal the summary totals. Dates affect the timeline, not the final counts. A campaign shorter than a month has one final point. Allow vertical scrolling within the chart for long campaigns.

Implement English and Bulgarian translations for labels, validation, cards, chart descriptions, and tooltips. Use English initially to match the screenshot. Use USD and EUR currency options with locale-aware formatting. Changing currency changes the unit and formatting of both monetary fields while preserving the entered numeric amounts; it does not perform exchange-rate conversion. Explain that behavior beside the control.

## 5. Proposed project structure

```text
lead-predictor/
  public/
    index.html
    css/styles.css
    js/app.js          # Input events, validation display, state, rendering
    js/calculator.js   # Pure funnel calculations and validation
    js/chart.js        # Campaign periods and SVG rendering
    js/i18n.js         # English/Bulgarian text and locale formatting
  tests/
    calculator.test.js
    timeline.test.js
  package.json        # ES modules and built-in Node test script
  netlify.toml
  .gitignore
  README.md
  IMPLEMENTATION_PLAN.md
```

Serve `public/` with a local static server during development. Node is only a development/test tool; the deployed application consists of HTML, CSS, and JavaScript files. Keep calculations separate from the DOM so their correctness is easy to test.

## 6. GitHub history and implementation sequence

Initialize a new repository with a minimal bootstrap commit establishing `main`. Do not count that setup commit toward the five meaningful development commits. All application changes and the revert then enter `main` through pull requests.

Create each branch from the latest merged `main`, commit its bounded change, push, open a PR, review and validate, then merge before starting the next dependent branch.

| Order | Proposed branch | Meaningful deliverable / commit |
| --- | --- | --- |
| 1 | `feature/page-layout` | Add semantic calculator markup, responsive dark styling, and static hosting configuration; use separate markup and styling commits where useful. |
| 2 | `feature/calculator` | Implement formulas, input validation, live cards, and calculation tests. |
| 3 | `feature/campaign-chart` | Add cumulative SVG bars, date handling, tooltips, accessible chart data, and timeline tests. |
| 4 | `feature/preferences` | Add English/Bulgarian translations and USD/EUR formatting. |
| 5 | `experiment/chart-animation` | Add a small, isolated chart transition to evaluate how animation feels during repeated slider changes. |
| 6 | `revert/chart-animation` | Revert the animation commit with `git revert <commit-sha>` and document the decision to retain immediate chart updates. |
| 7 | `chore/release-documentation` | Add setup instructions, formula assumptions, verification results, live URL, and assignment evidence. |

The animation is an intentional, documented learning experiment, not an invented defect. Keep its original commit and the revert visible on `main`. Revert the individual animation commit rather than its PR merge commit.

Use ordinary merge commits for PRs to retain the original commits. Keep all seven remote branches until grading is complete; disable automatic branch deletion and do not manually delete them. This exceeds the minimum of five additional branches. See [GitHub branch deletion settings](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches).

A genuine `git revert` creates a new commit that reverses an earlier change; retain both in history. See [Git's revert documentation](https://git-scm.com/docs/git-revert).

## 7. Netlify deployment

When implementation starts, verify existing GitHub and Netlify authentication and use the user's accounts. If an account connection is missing, complete the provider's login flow at that point.

After the first layout PR is merged, connect the public repository to a Netlify project using Git-based continuous deployment. Set production branch to `main`, publish directory to `public`, and leave the build command empty because there is no compilation step. Netlify documents repository integration and publish directories in its [build configuration guide](https://docs.netlify.com/build/configure-builds/overview/).

Enable or verify Deploy Previews for subsequent PRs, then test them before merging. Merges to `main` publish the production site. See [Netlify Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/).

Use the supplied `netlify.app` URL. Verify the final production site opens without a login in a private browser window. Add its actual URL to the README. A custom domain is unnecessary for the assignment.

## 8. Verification and submission

Automated checks should target the calculator and date logic:

- Reference case: 10 customers, 25 leads, 125 prospects; card shares 100%, 20%, 8%.
- Rounding case: revenue 10,001, average order 1,000, rates 40%/20% yields 11 customers, 28 leads, 140 prospects.
- Zero revenue; both rates at 100%; low response rates; invalid, missing, negative, non-finite, and oversized values.
- Short campaigns, partial months, month-end starts, leap years, invalid date order, and correct final chart totals.

Manually verify desktop, tablet, and phone layouts; English/Bulgarian text; currency formatting; all inputs and sliders; keyboard navigation; tooltip touch behavior; screen-reader labels; and the absence of browser errors or broken assets. Repeat a concise smoke check on the production URL.

The README should explain local setup, tests, formulas, rounding, timeline assumptions, currency behavior, and the Git workflow. Include links to the merged PRs and both the original animation commit and its revert.

Submission is complete when the public repository and Netlify URL work, at least five meaningful development commits are visible through merged PRs, at least five additional remote branches remain, the reverted commit is easy to inspect, and the calculator passes the checks above.
