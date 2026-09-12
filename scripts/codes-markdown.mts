export type CodeRate = { code: string; name: string };

export function renderCodesMarkdown(rates: CodeRate[], date: string): string {
  return [
    '# bitpay-rates',
    '',
    `## Available Codes (updated: ${date})`,
    '',
    `This is the complete list of ${rates.length} codes from \`GET /rates/BTC\`:`,
    '',
    ...rates.map((rate) => `- ${rate.code} (${rate.name})`),
    '',
  ].join('\n');
}
