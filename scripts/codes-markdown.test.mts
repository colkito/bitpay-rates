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

    assert.match(markdown, /^# bitpay-rates\n/);
    assert.match(markdown, /## Available Codes \(updated: 2026-09-12\)/);
    assert.match(markdown, /complete list of 2 codes/);
    assert.match(markdown, /^- BTC \(Bitcoin\)$/m);
    assert.match(markdown, /^- USD \(US Dollar\)$/m);
  });

  it('keeps a hostile name from breaking the list', () => {
    const markdown = renderCodesMarkdown([{ code: 'EVL', name: 'Evil\n- FAKE (Injected)' }], 'd');

    assert.match(markdown, /^- EVL \(Evil - FAKE \(Injected\)\)$/m);
    assert.equal(markdown.split('\n').filter((l) => l.startsWith('- ')).length, 1);
  });
});
