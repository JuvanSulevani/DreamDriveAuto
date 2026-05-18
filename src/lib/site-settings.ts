export type DealerHour = {
  day: string;
  hours: string;
};

export type SiteSettings = {
  dealer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    hours: DealerHour[];
  };
  home: {
    heroEyebrow: string;
    heroTitleLine1: string;
    heroTitleAccent: string;
    heroBody: string;
    heroImageUrl: string;
    featuredEyebrow: string;
    featuredHeading: string;
    featuredAccent: string;
    featuredBody: string;
    philosophyEyebrow: string;
    philosophyHeading: string;
    appointmentEyebrow: string;
    appointmentHeading: string;
    appointmentAccent: string;
    appointmentBody: string;
  };
  about: {
    eyebrow: string;
    heading: string;
    headingAccent: string;
    storyLabel: string;
    story: {
      primary: string;
      secondary: string;
      quote: string;
    };
    stats: { value: string; label: string }[];
    visitEyebrow: string;
    visitHeading: string;
    visitAccent: string;
  };
  contact: {
    eyebrow: string;
    heading: string;
    headingAccent: string;
    intro: string;
  };
  footer: {
    tagline: string;
  };
  pages: {
    financingVisible: boolean;
    tradeInVisible: boolean;
    sellVisible: boolean;
    serviceVisible: boolean;
    aboutVisible: boolean;
  };
};

export type SiteSettingField = {
  key: string;
  group: string;
  label: string;
  input: 'text' | 'textarea' | 'email' | 'tel' | 'url' | 'image' | 'boolean';
  rows?: number;
  help?: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  dealer: {
    name: process.env.DEALER_NAME || 'Dream Drive Auto',
    phone: process.env.DEALER_PHONE || '+1 (555) 014-7300',
    email: process.env.DEALER_EMAIL || process.env.LEADS_NOTIFY_TO || 'hello@dreamdriveauto.com',
    address: process.env.DEALER_ADDRESS || '100 King St W, Toronto, ON M5X 1A9',
    website: process.env.DEALER_WEBSITE || 'https://dreamdriveauto.com',
    hours: [
      { day: 'Monday - Friday', hours: '9:00 - 19:00' },
      { day: 'Saturday', hours: '10:00 - 18:00' },
      { day: 'Sunday', hours: '11:00 - 16:00' }
    ]
  },
  home: {
    heroEyebrow: 'Volume 01 - Current Catalogue',
    heroTitleLine1: 'Cars worth',
    heroTitleAccent: 'keeping.',
    heroBody:
      'A curated showroom of meticulously sourced performance, luxury, and pre-owned vehicles. Every car inspected. Every story documented. No pressure. No haggling.',
    heroImageUrl: '',
    featuredEyebrow: '001 - The Selection',
    featuredHeading: "This week's",
    featuredAccent: 'favourites.',
    featuredBody:
      'A small selection of cars in current rotation, chosen for their condition, specification, and the stories they carry.',
    philosophyEyebrow: '002 - Philosophy',
    philosophyHeading:
      "We sell cars the way we'd want to buy them: each vetted on its merits, priced honestly, presented thoroughly. No back-room games. No surprise add-ons. No finance product you did not ask for.",
    appointmentEyebrow: '004 - By Appointment',
    appointmentHeading: 'Visit the',
    appointmentAccent: 'showroom.',
    appointmentBody:
      "Our floor is shown by appointment so we can give every guest unhurried attention. Coffee will be ready. The car you're interested in will be detailed and waiting."
  },
  about: {
    eyebrow: 'About',
    heading: 'A small dealership',
    headingAccent: 'with strong opinions about cars.',
    storyLabel: 'Our story',
    story: {
      primary:
        "Dream Drive Auto was founded on a simple frustration: buying a used car should not feel like a negotiation tactic competition. We started this dealership to do the opposite: source carefully, document everything, price honestly, and treat every guest the way we'd want to be treated.",
      secondary:
        "We're small on purpose. A short floor of cars we believe in, photographed properly, inspected thoroughly. You'll meet the people who picked, vetted, and reconditioned the car you came to see, not a stranger reading from a printout.",
      quote: 'The car deserves to be presented the way it was designed.'
    },
    stats: [
      { value: '180+', label: 'Cars sold in 2024' },
      { value: '4.9', label: 'Average review' },
      { value: '0%', label: 'Forced add-ons' },
      { value: '7-Day', label: 'Return policy' }
    ],
    visitEyebrow: 'Visit us',
    visitHeading: 'Come by.',
    visitAccent: "Let's talk cars."
  },
  contact: {
    eyebrow: 'Get in touch',
    heading: 'Visit, call,',
    headingAccent: 'or write.',
    intro:
      "We respond to every inquiry personally. Whether you're shopping, trading, or just curious, we'd love to hear from you."
  },
  footer: {
    tagline:
      'A boutique showroom for vehicles worth keeping. By appointment. No pressure. No haggling. Just well-sourced cars.'
  },
  pages: {
    financingVisible: true,
    tradeInVisible: true,
    sellVisible: true,
    serviceVisible: true,
    aboutVisible: true
  }
};

export const SITE_SETTING_FIELDS: SiteSettingField[] = [
  { key: 'dealer.name', group: 'Dealer information', label: 'Dealer name', input: 'text' },
  { key: 'dealer.phone', group: 'Dealer information', label: 'Phone number', input: 'tel' },
  { key: 'dealer.email', group: 'Dealer information', label: 'Public email', input: 'email' },
  { key: 'dealer.address', group: 'Dealer information', label: 'Showroom address', input: 'textarea', rows: 2 },
  { key: 'dealer.website', group: 'Dealer information', label: 'Website URL', input: 'url' },
  { key: 'dealer.hours.0.day', group: 'Showroom hours', label: 'Hours row 1 label', input: 'text' },
  { key: 'dealer.hours.0.hours', group: 'Showroom hours', label: 'Hours row 1 time', input: 'text' },
  { key: 'dealer.hours.1.day', group: 'Showroom hours', label: 'Hours row 2 label', input: 'text' },
  { key: 'dealer.hours.1.hours', group: 'Showroom hours', label: 'Hours row 2 time', input: 'text' },
  { key: 'dealer.hours.2.day', group: 'Showroom hours', label: 'Hours row 3 label', input: 'text' },
  { key: 'dealer.hours.2.hours', group: 'Showroom hours', label: 'Hours row 3 time', input: 'text' },
  { key: 'home.heroEyebrow', group: 'Homepage hero', label: 'Eyebrow', input: 'text' },
  { key: 'home.heroTitleLine1', group: 'Homepage hero', label: 'Headline first line', input: 'text' },
  { key: 'home.heroTitleAccent', group: 'Homepage hero', label: 'Headline accent', input: 'text' },
  { key: 'home.heroBody', group: 'Homepage hero', label: 'Intro copy', input: 'textarea', rows: 4 },
  { key: 'home.heroImageUrl', group: 'Homepage hero', label: 'Hero background image', input: 'image' },
  { key: 'home.featuredEyebrow', group: 'Homepage sections', label: 'Featured eyebrow', input: 'text' },
  { key: 'home.featuredHeading', group: 'Homepage sections', label: 'Featured heading', input: 'text' },
  { key: 'home.featuredAccent', group: 'Homepage sections', label: 'Featured accent', input: 'text' },
  { key: 'home.featuredBody', group: 'Homepage sections', label: 'Featured body', input: 'textarea', rows: 3 },
  { key: 'home.philosophyEyebrow', group: 'Homepage sections', label: 'Philosophy eyebrow', input: 'text' },
  { key: 'home.philosophyHeading', group: 'Homepage sections', label: 'Philosophy copy', input: 'textarea', rows: 5 },
  { key: 'home.appointmentEyebrow', group: 'Homepage appointment', label: 'Appointment eyebrow', input: 'text' },
  { key: 'home.appointmentHeading', group: 'Homepage appointment', label: 'Appointment heading', input: 'text' },
  { key: 'home.appointmentAccent', group: 'Homepage appointment', label: 'Appointment accent', input: 'text' },
  { key: 'home.appointmentBody', group: 'Homepage appointment', label: 'Appointment body', input: 'textarea', rows: 4 },
  { key: 'about.eyebrow', group: 'About page', label: 'Eyebrow', input: 'text' },
  { key: 'about.heading', group: 'About page', label: 'Heading', input: 'text' },
  { key: 'about.headingAccent', group: 'About page', label: 'Heading accent', input: 'text' },
  { key: 'about.storyLabel', group: 'About page', label: 'Story section label', input: 'text' },
  { key: 'about.story.primary', group: 'About page', label: 'Story paragraph 1', input: 'textarea', rows: 5 },
  { key: 'about.story.secondary', group: 'About page', label: 'Story paragraph 2', input: 'textarea', rows: 5 },
  { key: 'about.story.quote', group: 'About page', label: 'Quote', input: 'textarea', rows: 2 },
  { key: 'about.stats.0.value', group: 'About stats', label: 'Stat 1 value', input: 'text' },
  { key: 'about.stats.0.label', group: 'About stats', label: 'Stat 1 label', input: 'text' },
  { key: 'about.stats.1.value', group: 'About stats', label: 'Stat 2 value', input: 'text' },
  { key: 'about.stats.1.label', group: 'About stats', label: 'Stat 2 label', input: 'text' },
  { key: 'about.stats.2.value', group: 'About stats', label: 'Stat 3 value', input: 'text' },
  { key: 'about.stats.2.label', group: 'About stats', label: 'Stat 3 label', input: 'text' },
  { key: 'about.stats.3.value', group: 'About stats', label: 'Stat 4 value', input: 'text' },
  { key: 'about.stats.3.label', group: 'About stats', label: 'Stat 4 label', input: 'text' },
  { key: 'about.visitEyebrow', group: 'About page', label: 'Visit eyebrow', input: 'text' },
  { key: 'about.visitHeading', group: 'About page', label: 'Visit heading', input: 'text' },
  { key: 'about.visitAccent', group: 'About page', label: 'Visit accent', input: 'text' },
  { key: 'contact.eyebrow', group: 'Contact page', label: 'Eyebrow', input: 'text' },
  { key: 'contact.heading', group: 'Contact page', label: 'Heading', input: 'text' },
  { key: 'contact.headingAccent', group: 'Contact page', label: 'Heading accent', input: 'text' },
  { key: 'contact.intro', group: 'Contact page', label: 'Intro copy', input: 'textarea', rows: 4 },
  { key: 'footer.tagline', group: 'Footer', label: 'Footer tagline', input: 'textarea', rows: 3 },
  { key: 'pages.financingVisible', group: 'Page visibility', label: 'Show Financing page', input: 'boolean', help: 'When off: hidden from nav, footer, and sitemap; the URL returns 404.' },
  { key: 'pages.tradeInVisible', group: 'Page visibility', label: 'Show Trade-In page', input: 'boolean', help: 'When off: hidden from nav, footer, and sitemap; the URL returns 404.' },
  { key: 'pages.sellVisible', group: 'Page visibility', label: 'Show Sell page', input: 'boolean', help: 'When off: hidden from nav, footer, and sitemap; the URL returns 404.' },
  { key: 'pages.serviceVisible', group: 'Page visibility', label: 'Show Service page', input: 'boolean', help: 'When off: hidden from nav, footer, and sitemap; the URL returns 404.' },
  { key: 'pages.aboutVisible', group: 'Page visibility', label: 'Show About page', input: 'boolean', help: 'When off: hidden from nav, footer, and sitemap; the URL returns 404.' }
];

export const SITE_SETTING_KEYS = new Set(SITE_SETTING_FIELDS.map((field) => field.key));

const FIELD_BY_KEY = new Map(SITE_SETTING_FIELDS.map((field) => [field.key, field]));

export function flattenSiteSettings(settings: SiteSettings = DEFAULT_SITE_SETTINGS): Record<string, string> {
  return Object.fromEntries(
    SITE_SETTING_FIELDS.map((field) => {
      const value = readPath(settings, field.key);
      // Booleans live in the typed model but serialise to "true"/"false" strings
      // for both DB storage and the admin form.
      if (typeof value === 'boolean') return [field.key, value ? 'true' : 'false'];
      return [field.key, value == null ? '' : String(value)];
    })
  );
}

export function mergeSiteSettings(overrides: Record<string, string | null | undefined> = {}): SiteSettings {
  const next = cloneSettings(DEFAULT_SITE_SETTINGS);

  for (const field of SITE_SETTING_FIELDS) {
    const value = overrides[field.key];
    if (value != null) setPath(next, field.key, value, field.input);
  }

  return next;
}

function cloneSettings(settings: SiteSettings): SiteSettings {
  return JSON.parse(JSON.stringify(settings)) as SiteSettings;
}

function readPath(source: SiteSettings, path: string): unknown {
  return path.split('.').reduce<unknown>((value, part) => {
    if (value == null) return '';
    if (Array.isArray(value)) return value[Number(part)];
    return (value as Record<string, unknown>)[part];
  }, source);
}

function setPath(target: SiteSettings, path: string, value: string, input?: SiteSettingField['input']) {
  // Boolean fields ship in/out as "true"/"false" strings but live as real booleans
  // on the typed SiteSettings tree. Default treats anything other than "true" as false.
  const coerced: unknown = input === 'boolean' ? value === 'true' : value;

  const parts = path.split('.');
  let cursor: unknown = target;

  for (const part of parts.slice(0, -1)) {
    cursor = Array.isArray(cursor)
      ? cursor[Number(part)]
      : (cursor as Record<string, unknown>)[part];
  }

  const leaf = parts[parts.length - 1];
  if (Array.isArray(cursor)) cursor[Number(leaf)] = coerced as never;
  else (cursor as Record<string, unknown>)[leaf] = coerced;
}

export function getSiteSettingField(key: string) {
  return FIELD_BY_KEY.get(key);
}
