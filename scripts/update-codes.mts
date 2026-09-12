import { writeFile } from 'node:fs/promises';

import { get } from '../src/index.mts';
import { renderCodesMarkdown } from './codes-markdown.mts';

const rates = await get();
const date = new Date().toISOString().slice(0, 10);

await writeFile('CODES.md', renderCodesMarkdown(rates, date));
console.log(`Wrote ${rates.length} codes to CODES.md`);
