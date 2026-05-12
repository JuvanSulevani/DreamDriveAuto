export const DEALER = {
  name: process.env.DEALER_NAME || 'Dream Drive Auto',
  phone: process.env.DEALER_PHONE || '+1 (555) 014-7300',
  email: process.env.DEALER_EMAIL || process.env.LEADS_NOTIFY_TO || 'hello@dreamdriveauto.com',
  address: process.env.DEALER_ADDRESS || '2200 Mercer St, Seattle, WA 98109',
  website: process.env.DEALER_WEBSITE || 'https://dreamdriveauto.com',
  hours: [
    { day: 'Mon — Fri', open: '9:00', close: '19:00' },
    { day: 'Saturday', open: '10:00', close: '18:00' },
    { day: 'Sunday', open: '11:00', close: '16:00' }
  ]
};
