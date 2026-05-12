import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings } from './site-settings';

test('mergeSiteSettings applies saved dealer and about-page copy over defaults', () => {
  const settings = mergeSiteSettings({
    'dealer.phone': '+1 (416) 555-0199',
    'dealer.email': 'sales@example.ca',
    'about.story.primary': 'A customer-written about section.'
  });

  assert.equal(settings.dealer.phone, '+1 (416) 555-0199');
  assert.equal(settings.dealer.email, 'sales@example.ca');
  assert.equal(settings.about.story.primary, 'A customer-written about section.');
  assert.equal(settings.about.stats[0].value, DEFAULT_SITE_SETTINGS.about.stats[0].value);
});
