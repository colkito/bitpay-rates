import { writeFile } from 'node:fs/promises';

import { type CodeRate, renderCodesMarkdown } from './codes-markdown';

const URL = 'https://bitpay.com/rates/BTC';

async function main(): Promise<void> {
  const res = await fetch(URL, {
    headers: {
      'X-Accept-Version': '2.0.0',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Request to ${URL} failed with HTTP ${res.status}`);
  }

  const json: unknown = await res.json();
  if (
    typeof json !== 'object' ||
    json === null ||
    !('data' in json) ||
    !Array.isArray((json as { data: unknown }).data)
  ) {
    throw new Error(`Unexpected response from ${URL}`);
  }

  const rates = (json as { data: CodeRate[] }).data;
  const date = new Date().toISOString().slice(0, 10);
  await writeFile('CODES.md', renderCodesMarkdown(rates, date));
  console.log(`Wrote ${rates.length} codes to CODES.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
