export type CodeRate = { code: string; name: string };

/**
 * BitPay's text lands in a repo file written by a job that holds
 * `contents: write`, so neutralise what could restructure the list: newlines
 * that would forge an entry, and the characters that open a link, a code span
 * or raw HTML. Parentheses and `*` are left alone — they cannot do anything on
 * their own once `[` is escaped, and real names use them ("Gold (troy ounce)").
 */
const clean = (value: string) =>
  value
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\\`[\]<>]/g, '\\$&')
    .trim();

export function renderCodesMarkdown(rates: CodeRate[], date: string): string {
  return [
    '# bitpay-rates',
    '',
    `## Available Codes (updated: ${date})`,
    '',
    `This is the complete list of ${rates.length} codes from \`GET /rates/BTC\`:`,
    '',
    ...rates.map((rate) => `- ${clean(rate.code)} (${clean(rate.name)})`),
    '',
    'Codes containing `_` (chain-specific variants such as `USDC_arb`) appear in',
    'this table but BitPay rejects them as a `base` or `quote`, so `get()` cannot',
    'query them individually.',
    '',
  ].join('\n');
}
