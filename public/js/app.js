import { calculateCampaign } from './calculator.js';
import { campaignTimeline, renderChart } from './chart.js';

const form = document.querySelector('#campaign-form');
const fields = {
  revenue: document.querySelector('#revenue'),
  orderValue: document.querySelector('#order-value'),
  startDate: document.querySelector('#start-date'),
  endDate: document.querySelector('#end-date'),
  leadRate: document.querySelector('#lead-rate'),
  prospectRate: document.querySelector('#prospect-rate'),
};
const messages = {
  invalidRevenue: 'Enter a nonnegative amount with up to 2 decimal places.',
  invalidOrder: 'Enter an order value greater than zero, with up to 2 decimals.',
  invalidRate: 'Choose a whole percentage between 1 and 100.',
  invalidDate: 'Choose a valid date.',
  invalidDateOrder: 'The end date must be after the start date.',
  campaignTooLong: 'Choose a campaign of 10 years or less.',
  tooLarge: 'This target is too large. Lower the revenue or increase the response rates.',
};
let announcementTimer;
const chartContainer = document.querySelector('#chart-container');
const chartTable = document.querySelector('#chart-table-body');
let currentPeriods = [];

function update() {
  const input = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));
  const result = calculateCampaign(input);
  for (const [key, field] of Object.entries(fields)) {
    const error = result.errors?.[key];
    field.setAttribute('aria-invalid', String(Boolean(error)));
    const errorNode = document.querySelector(`#${field.id}-error`);
    if (errorNode) {
      errorNode.textContent = error ? messages[error] : '';
      errorNode.hidden = !error;
    }
  }
  for (const id of ['lead-rate', 'prospect-rate']) {
    const slider = document.querySelector(`#${id}`);
    slider.style.setProperty('--fill', `${(Number(slider.value) - 1) / 99 * 100}%`);
    document.querySelector(`#${id}-output`).replaceChildren(document.createTextNode(slider.value), Object.assign(document.createElement('span'), { textContent: '%' }));
    slider.setAttribute('aria-valuetext', `${slider.value}%`);
  }
  const errorSummary = document.querySelector('#calculation-error');
  errorSummary.hidden = result.ok;
  errorSummary.textContent = result.ok ? '' : 'Check the highlighted fields to see your campaign estimate.';
  for (const key of ['prospects', 'leads', 'customers']) {
    const value = result.ok ? new Intl.NumberFormat('en').format(result.counts[key]) : '—';
    const count = document.querySelector(`#${key}-count`);
    count.textContent = value;
    count.classList.toggle('compact', value.length > 7);
    document.querySelector(`#${key}-percent`).textContent = result.ok ? `${new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(result.shares[key])}%` : '—';
    document.querySelector(`#${key}-bar`).style.width = `${result.ok ? result.shares[key] : 0}%`;
  }
  document.querySelector('#campaign-goal').textContent = result.ok ? `${new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(result.revenue)} goal` : '—';
  currentPeriods = result.ok ? campaignTimeline(result.start, result.end, result.counts) : [];
  document.querySelector('#campaign-duration').textContent = result.ok ? `${currentPeriods.length} ${currentPeriods.length === 1 ? 'month' : 'months'}` : '—';
  renderChart(chartContainer, chartTable, currentPeriods);
  clearTimeout(announcementTimer);
  announcementTimer = setTimeout(() => {
    document.querySelector('#results-announcement').textContent = result.ok ? `${result.counts.prospects} prospects, ${result.counts.leads} leads, ${result.counts.customers} customers.` : errorSummary.textContent;
  }, 300);
}

form.addEventListener('submit', event => event.preventDefault());
// Sliders are associated with the form but live outside it in the layout.
Object.values(fields).forEach(field => field.addEventListener('input', update));
let previousWidth = 0;
new ResizeObserver(([entry]) => {
  if (Math.abs(entry.contentRect.width - previousWidth) > 1) {
    previousWidth = entry.contentRect.width;
    renderChart(chartContainer, chartTable, currentPeriods);
  }
}).observe(chartContainer);
update();
