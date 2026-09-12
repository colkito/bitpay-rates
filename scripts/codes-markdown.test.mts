import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { renderCodesMarkdown } from './codes-markdown.mts';

describe('renderCodesMarkdown', () => {
  it('renders a dated list with the live count', () => {
    const markdown = renderCodesMarkdown(
      [
        { code: 'BTC', name: 'Bitcoin' },
        { code: 'USD', name: 'US Dollar' },
      ],
      '2026-09-12',
    );

    assert.equal(
      markdown,
      [
        '# bitpay-rates',
        '',
        '## Available Codes (updated: 2026-09-12)',
        '',
        'This is the complete list of 2 codes from `GET /rates/BTC`:',
        '',
        '- BTC (Bitcoin)',
        '- USD (US Dollar)',
        '',
      ].join('\n'),
    );
  });
});
