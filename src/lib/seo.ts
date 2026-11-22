export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
}

export const SEO_CONFIGS: Record<string, PageSeoConfig> = {
  home: {
    title: 'SKYRA CREATIONS — Fashion Model Training & Events Organising',
    description: 'Premier fashion model training, catwalk grooming, and fashion event organising platform by B Sriram. Professional auditions, runway showcases, and designer events in Chennai.',
    canonicalPath: '/',
    noindex: false,
  },
  about: {
    title: 'About SKYRA CREATIONS | Fashion Model Training & Runway Platform',
    description: 'Learn about SKYRA CREATIONS, founded by B Sriram. Empowering aspiring models through professional catwalk showcases, stage grooming, model training, and inclusive fashion event organising.',
    canonicalPath: '/about',
    noindex: false,
  },
  'what-we-do': {
    title: 'What We Do | Fashion Model Training & Events Organising | SKYRA CREATIONS',
    description: 'Explore our services: Fashion Model Training, Runway Shows, Event Organising, Designer Showcases, Ramp Walk Coaching, and Creative Productions.',
    canonicalPath: '/what-we-do',
    noindex: false,
  },
  events: {
    title: 'Upcoming Events & Auditions | SKYRA CREATIONS',
    description: 'Browse upcoming runway fashion shows and model audition events by SKYRA CREATIONS. View details and register online.',
    canonicalPath: '/events',
    noindex: false,
  },
  'event-details': {
    title: 'Runway Show 2026 Details & Registration | SKYRA CREATIONS',
    description: 'Event details, location, fee breakdown, eligibility and guidelines for SKYRA CREATIONS Runway Show 2026 in Chennai.',
    canonicalPath: '/events/runway-2026',
    noindex: false,
  },
  gallery: {
    title: 'Runway Gallery & Highlights | SKYRA CREATIONS',
    description: 'View highlights from official SKYRA CREATIONS fashion runways, catwalk presentations, model showcases and stage moments.',
    canonicalPath: '/gallery',
    noindex: false,
  },
  contact: {
    title: 'Contact Us | SKYRA CREATIONS Official Helpdesk',
    description: 'Connect with SKYRA CREATIONS on Instagram @skyra_creations_ or via verified helpline for registration and audition support.',
    canonicalPath: '/contact',
    noindex: false,
  },
  register: {
    title: 'Model Registration & Auditions 2026 | SKYRA CREATIONS',
    description: 'Register for SKYRA CREATIONS fashion model training and Runway Show 2026 auditions in Chennai. Token advance options ₹500, ₹1,000, or ₹1,500. All categories welcome.',
    canonicalPath: '/register',
    noindex: false,
  },
  payment: {
    title: 'Official Fee Payment & Verification | SKYRA CREATIONS',
    description: 'Secure UPI payment portal for SKYRA CREATIONS Runway Show 2026. Settle token advances, clear fee installments, and upload bank UTR proofs.',
    canonicalPath: '/payment',
    noindex: false,
  },
  balance: {
    title: 'Event Payment & Clearance | SKYRA CREATIONS',
    description: 'Complete your fashion show registration payment and clear remaining dues securely for upcoming SKYRA CREATIONS runway events.',
    canonicalPath: '/balance',
    noindex: false,
  },
  status: {
    title: 'Check Registration Status & Entry Pass | SKYRA CREATIONS',
    description: 'Track your SKYRA CREATIONS Runway Show 2026 registration verification progress and access your official digital runway entry pass.',
    canonicalPath: '/status',
    noindex: false,
  },
  admin: {
    title: 'Admin Operations Portal | SKYRA CREATIONS',
    description: 'Restricted administrative dashboard for SKYRA CREATIONS event operations and verification.',
    canonicalPath: '/admin',
    noindex: true,
  },
  'not-found': {
    title: 'Page Not Found | SKYRA CREATIONS',
    description: 'The requested page could not be found on SKYRA CREATIONS.',
    canonicalPath: '/404',
    noindex: true,
  },
};

const BASE_CANONICAL_DOMAIN = 'https://www.skyracreations.site';

export function updatePageSeo(tabId: string) {
  if (typeof document === 'undefined') return;

  const config = SEO_CONFIGS[tabId] || SEO_CONFIGS['register'];

  // 1. Update Title
  document.title = config.title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. Update Canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  const fullCanonicalUrl = config.canonicalPath === '/' 
    ? `${BASE_CANONICAL_DOMAIN}/` 
    : `${BASE_CANONICAL_DOMAIN}${config.canonicalPath}`;
  canonicalLink.setAttribute('href', fullCanonicalUrl);

  // 4. Update Robots Meta
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  if (config.noindex) {
    metaRobots.setAttribute('content', 'noindex, nofollow');
  } else {
    metaRobots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }

  // 5. Update Open Graph Title & Description
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', config.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', config.description);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', fullCanonicalUrl);
}
