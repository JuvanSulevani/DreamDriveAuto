import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice } from './format';

test('formatPrice renders dealership prices as Canadian dollars', () => {
  assert.equal(formatPrice(12345600), 'CA$123,456');
});
