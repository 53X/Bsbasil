import type { StoreAbout, StoreContact, StoreProduct } from './types';

/** Copy used when Shopify has no published entry yet. */
export const FALLBACK_ABOUT: StoreAbout = {
  eyebrow: 'Our Story',
  heading: 'Made with Love,',
  headingAccent: 'Worn with Joy',
  lede: 'Bsbasil was born from a simple belief — every little one deserves clothes that are as gentle as they are adorable.',
  story: 'Founded by parents, for parents. We design every piece with tiny humans in mind — soft fabrics, safe dyes, and thoughtful fits that grow with your baby.',
  valuesHeading: 'What We',
  valuesHeadingAccent: 'Stand For',
  valuesIntro: 'Every Bsbasil piece is guided by three core promises.',
  values: [
    {
      title: 'Pure & Safe',
      description: 'Only non-toxic, baby-safe dyes and OEKO-TEX certified fabrics — because your little one deserves nothing less than the purest.',
    },
    {
      title: 'Comfort First',
      description: 'Tagless, seamless designs that never irritate delicate skin. Every stitch is crafted with tiny, sensitive bodies in mind.',
    },
    {
      title: 'Made Responsibly',
      description: 'Ethically sourced materials and sustainable packaging — because the world your baby grows up in matters just as much.',
    },
  ],
  safetyHeading: 'Our Safety',
  safetyHeadingAccent: 'Promise',
  safetyBody: 'Every Bsbasil garment is tested to meet international baby safety standards. We use only OEKO-TEX certified fabrics — free from harmful chemicals, dyes, and irritants. Because your baby\'s skin deserves nothing less.',
  badges: ['OEKO-TEX Certified', 'Non-Toxic Dyes', 'Dermatologist Tested', 'Made for Sensitive Skin'],
  founderEyebrow: 'A note from our founder',
  founderQuote: 'When my daughter was born, I couldn\'t find clothes that were truly soft, safe, and beautiful all at once. So I made them. Bsbasil is my love letter to every parent who wants the very best for their little one.',
  founderName: 'Founder, Bsbasil',
  ctaHeading: 'Dress your little one',
  ctaHeadingAccent: 'in love',
  ctaBody: 'Explore our collection of soft, safe, and adorable clothes for ages 0–3.',
  ctaLabel: 'Shop Now',
  ctaHref: '/catalog',
};

export const FALLBACK_CONTACT: StoreContact = {
  eyebrow: 'Get in touch',
  heading: 'We\'d love to',
  headingAccent: 'hear from you',
  subheading: 'Questions about sizing, orders, or our fabrics? Drop us a message and we\'ll get back to you within 24 hours.',
  detailsHeading: 'Contact details',
  detailsBody: 'Reach out through any of the channels below, or fill in the form and we\'ll respond promptly.',
  email: 'packology.ent@gmail.com',
  phone: '+91 77009 05962',
  phoneHref: 'tel:+917700905962',
  location: 'India',
  hours: 'Mon – Sat, 10 AM – 6 PM IST',
  responseTime: 'We reply within 24 hours',
  trustLabel: 'Parents first',
  trustBody: 'Every message is read by our team. We\'re a small brand that genuinely cares — no bots, no templates.',
  formHeading: 'Send us',
  formHeadingAccent: 'a message',
  successHeading: 'Continue on WhatsApp',
  successBody: 'Your message is ready in WhatsApp. Tap send there and we\'ll get back to you within 24 hours.',
  successCta: 'Send another message',
};

export const FALLBACK_BESTSELLER_TITLE = { lead: 'BEST', accent: 'SELLERS' };

export interface MetaobjectFieldNode {
  key: string;
  value: string | null;
  reference?: {
    handle?: string;
    products?: { nodes: unknown[] };
  } | null;
  references?: {
    nodes: { fields?: { key: string; value: string | null }[] }[];
  } | null;
}

export function fieldText(fields: MetaobjectFieldNode[], key: string) {
  return fields.find((field) => field.key === key)?.value?.trim() || '';
}

export function fieldList(fields: MetaobjectFieldNode[], key: string): string[] {
  const raw = fieldText(fields, key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    return raw.split('\n').map((line) => line.trim()).filter(Boolean);
  }
  return [];
}

export function storyPoints(fields: MetaobjectFieldNode[]): { title: string; description: string }[] {
  const nodes = fields.find((field) => field.key === 'values')?.references?.nodes ?? [];
  return nodes.flatMap((node) => {
    const title = node.fields?.find((field) => field.key === 'title')?.value?.trim() || '';
    const description = node.fields?.find((field) => field.key === 'description')?.value?.trim() || '';
    return title ? [{ title, description }] : [];
  });
}

/** Keep in-site links when a Shopify URL field stores the public shop address. */
export function sitePath(href: string) {
  const trimmed = href.trim();
  if (!trimmed) return '/catalog';
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const url = new URL(trimmed);
    if (['bsbasil.com', 'www.bsbasil.com', 'bsbasil.vercel.app'].includes(url.hostname)) {
      return `${url.pathname}${url.search}` || '/catalog';
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

export function mapAbout(fields: MetaobjectFieldNode[]): StoreAbout | null {
  const heading = fieldText(fields, 'heading');
  if (!heading) return null;
  const values = storyPoints(fields);
  const badges = fieldList(fields, 'badges');
  return {
    eyebrow: fieldText(fields, 'eyebrow') || FALLBACK_ABOUT.eyebrow,
    heading,
    headingAccent: fieldText(fields, 'heading_accent'),
    lede: fieldText(fields, 'lede'),
    story: fieldText(fields, 'story'),
    valuesHeading: fieldText(fields, 'values_heading') || FALLBACK_ABOUT.valuesHeading,
    valuesHeadingAccent: fieldText(fields, 'values_heading_accent'),
    valuesIntro: fieldText(fields, 'values_intro'),
    values: values.length ? values : FALLBACK_ABOUT.values,
    safetyHeading: fieldText(fields, 'safety_heading') || FALLBACK_ABOUT.safetyHeading,
    safetyHeadingAccent: fieldText(fields, 'safety_heading_accent'),
    safetyBody: fieldText(fields, 'safety_body'),
    badges: badges.length ? badges : FALLBACK_ABOUT.badges,
    founderEyebrow: fieldText(fields, 'founder_eyebrow') || FALLBACK_ABOUT.founderEyebrow,
    founderQuote: fieldText(fields, 'founder_quote'),
    founderName: fieldText(fields, 'founder_name') || FALLBACK_ABOUT.founderName,
    ctaHeading: fieldText(fields, 'cta_heading') || FALLBACK_ABOUT.ctaHeading,
    ctaHeadingAccent: fieldText(fields, 'cta_heading_accent'),
    ctaBody: fieldText(fields, 'cta_body'),
    ctaLabel: fieldText(fields, 'cta_label') || FALLBACK_ABOUT.ctaLabel,
    ctaHref: sitePath(fieldText(fields, 'cta_link') || FALLBACK_ABOUT.ctaHref),
  };
}

export function mapContact(fields: MetaobjectFieldNode[]): StoreContact | null {
  const heading = fieldText(fields, 'heading');
  if (!heading) return null;
  const phoneHref = fieldText(fields, 'phone_href') || FALLBACK_CONTACT.phoneHref;
  return {
    eyebrow: fieldText(fields, 'eyebrow') || FALLBACK_CONTACT.eyebrow,
    heading,
    headingAccent: fieldText(fields, 'heading_accent'),
    subheading: fieldText(fields, 'subheading'),
    detailsHeading: fieldText(fields, 'details_heading') || FALLBACK_CONTACT.detailsHeading,
    detailsBody: fieldText(fields, 'details_body'),
    email: fieldText(fields, 'email') || FALLBACK_CONTACT.email,
    phone: fieldText(fields, 'phone') || FALLBACK_CONTACT.phone,
    phoneHref,
    location: fieldText(fields, 'location') || FALLBACK_CONTACT.location,
    hours: fieldText(fields, 'hours') || FALLBACK_CONTACT.hours,
    responseTime: fieldText(fields, 'response_time') || FALLBACK_CONTACT.responseTime,
    trustLabel: fieldText(fields, 'trust_label') || FALLBACK_CONTACT.trustLabel,
    trustBody: fieldText(fields, 'trust_body'),
    formHeading: fieldText(fields, 'form_heading') || FALLBACK_CONTACT.formHeading,
    formHeadingAccent: fieldText(fields, 'form_heading_accent'),
    successHeading: fieldText(fields, 'success_heading') || FALLBACK_CONTACT.successHeading,
    successBody: fieldText(fields, 'success_body'),
    successCta: fieldText(fields, 'success_cta') || FALLBACK_CONTACT.successCta,
  };
}

export function bestsellerProducts(fields: MetaobjectFieldNode[], mapNode: (node: unknown) => StoreProduct): StoreProduct[] {
  const collection = fields.find((field) => field.key === 'collection')?.reference;
  const nodes = collection?.products?.nodes ?? [];
  return nodes.map(mapNode);
}
