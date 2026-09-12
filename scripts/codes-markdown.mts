export type CodeRate = { code: string; name: string };

/** Third-party text lands in a repo file, so collapse anything that could break the list. */
const clean = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

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
