import { americanToDecimal } from './domain.mjs';

/** A price parser, not a prediction model. EVEN is the conventional +100 price. */
export function parseAmericanOdds(value) {
  if (typeof value === 'string') {
    const input = value.trim();
    if (/^even$/i.test(input)) return 100;
    if (!/^[+-]?\d+$/.test(input)) return null;
    value = Number(input);
  }
  return typeof value === 'number' && Number.isSafeInteger(value) && Math.abs(value) >= 100
    ? value : null;
}

function stakeInCents(value) {
  if (typeof value === 'string') {
    const input = value.trim();
    if (!/^[+]?(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(input)) return null;
    value = Number(input);
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > 100_000) return null;
  const cents = Math.round(value * 100);
  if (Math.abs(cents - value * 100) > 0.00001) return null;
  return cents > 0 ? cents : null;
}

/**
 * Calculate one entered price. impliedProbability is a fraction, never a forecast.
 * All dollar results are rounded to cents, half up, using integer arithmetic.
 */
export function analyzeOdds(american, stake) {
  const invalid = (reason) => ({
    valid: false, americanOdds: null, decimalOdds: null, impliedProbability: null,
    potentialProfit: null, potentialReturn: null, reason,
  });
  const price = parseAmericanOdds(american);
  if (price === null) return invalid('Enter American odds such as -110, +150, or EVEN. Use a whole number of at least +100 or at most -100.');
  const cents = stakeInCents(stake);
  if (cents === null) return invalid('Enter a hypothetical stake from $0.01 to $100,000, with no more than two decimal places.');
  const decimalOdds = americanToDecimal(price);
  const numerator = BigInt(cents) * BigInt(price > 0 ? price : 100);
  const denominator = BigInt(price > 0 ? 100 : Math.abs(price));
  const profitCents = (2n * numerator + denominator) / (2n * denominator);
  const returnCents = BigInt(cents) + profitCents;
  if (returnCents > BigInt(Number.MAX_SAFE_INTEGER)) return invalid('This price produces a return outside the supported calculation range. Enter a smaller price or stake.');
  const potentialProfit = Number(profitCents) / 100;
  const potentialReturn = Number(returnCents) / 100;
  const impliedProbability = 1 / decimalOdds;
  if (![decimalOdds, impliedProbability, potentialProfit, potentialReturn].every(Number.isFinite)) return invalid('This price is outside the supported calculation range.');
  return { valid: true, americanOdds: price, decimalOdds, impliedProbability, potentialProfit, potentialReturn, reason: '' };
}

function initializeOddsLab() {
  const form = document.getElementById('odds-lab-form');
  if (!form) return;
  const odds = document.getElementById('lab-odds');
  const stake = document.getElementById('lab-stake');
  const results = document.getElementById('lab-results');
  const decimal = document.getElementById('lab-decimal');
  const breakeven = document.getElementById('lab-breakeven');
  const profit = document.getElementById('lab-profit');
  const total = document.getElementById('lab-return');
  const error = document.getElementById('lab-error');
  const reset = document.getElementById('lab-reset');
  if ([odds, stake, results, decimal, breakeven, profit, total, error, reset].some((node) => !node)) return;
  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const decimalFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const percent = new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const invalidate = () => {
    results.hidden = true;
    error.textContent = '';
    error.hidden = true;
    for (const field of [decimal, breakeven, profit, total]) field.textContent = '';
    odds.removeAttribute('aria-invalid');
    stake.removeAttribute('aria-invalid');
  };
  form.noValidate = true; // Use one visible, accessible validation path for all inputs.
  results.setAttribute('aria-live', 'polite');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    invalidate();
    const analysis = analyzeOdds(odds.value, stake.value);
    if (!analysis.valid) {
      error.textContent = analysis.reason;
      error.hidden = false;
      const field = parseAmericanOdds(odds.value) === null ? odds : stake;
      field.setAttribute('aria-invalid', 'true');
      field.focus();
      return;
    }
    decimal.textContent = decimalFormat.format(analysis.decimalOdds);
    breakeven.textContent = percent.format(analysis.impliedProbability);
    profit.textContent = currency.format(analysis.potentialProfit);
    total.textContent = currency.format(analysis.potentialReturn);
    results.hidden = false;
  });
  odds.addEventListener('input', invalidate);
  stake.addEventListener('input', invalidate);
  reset.addEventListener('click', (event) => {
    event.preventDefault();
    odds.value = '';
    stake.value = '';
    invalidate();
    odds.focus();
  });
  invalidate();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeOddsLab, { once: true });
  else initializeOddsLab();
}
