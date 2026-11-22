export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
}

export const SEO_CONFIGS: Record<string, PageSeoConfig> = {
  home: {
    title: 'Skyra Creations | Runway Training & Modelling Academy',
    description: 'Skyra Creations offers runway training and modelling opportunities to help aspiring models build confidence, develop their skills and step into the fashion industry.',
    canonicalPath: '/',
    noindex: false,
  },
  about: {
    title: 'About Us | Runway Training & Modelling Academy | Skyra Creations',
    description: 'Founded by B Sriram, Skyra Creations is dedicated to runway training and modelling excellence, empowering aspiring models through professional catwalk grooming and showcase opportunities.',
    canonicalPath: '/about',
    noindex: false,
  },
  'what-we-do': {
    title: 'Runway Training & Modelling Disciplines | Skyra Creations',
    description: 'Explore our core disciplines: Runway Training, Catwalk Grooming, Stage Choreography, Modelling Opportunities, and Designer Showcases with Skyra Creations.',
    canonicalPath: '/what-we-do',
    noindex: false,
  },
  events: {
    title: 'Upcoming Runway Shows & Auditions | Skyra Creations',
    description: 'Discover upcoming fashion runway shows and model auditions with Skyra Creations. Build your confidence and step onto the catwalk in Chennai.',
    canonicalPath: '/events',
    noindex: false,
  },
  'event-details': {
    title: 'Runway Show 2026 Registration & Schedule | Skyra Creations',
    description: 'Complete details, venue specifications, and model registration guidelines for the signature Runway Show 2026 by Skyra Creations.',
    canonicalPath: '/events/runway-2026',
    noindex: false,
  },
  gallery: {
    title: 'Runway Showcase & Model Gallery | Skyra Creations',
    description: 'Explore catwalk highlights, backstage moments, and model performances from official Skyra Creations runway events.',
    canonicalPath: '/gallery',
    noindex: false,
  },
  contact: {
    title: 'Contact Us | Skyra Creations Runway Academy',
    description: 'Get in touch with Skyra Creations for runway training inquiries, model auditions, and fashion event collaborations.',
    canonicalPath: '/contact',
    noindex: false,
  },
  register: {
    title: 'Model Registration & Runway Auditions | Skyra Creations',
    description: 'Register for professional runway training and audition for Runway Show 2026 with Skyra Creations. Open to kids, teens, adults, and plus-size models.',
    canonicalPath: '/register',
    noindex: false,
  },
  payment: {
    title: 'Official Registration Fee Payment | Skyra Creations',
    description: 'Official secure UPI payment gateway for Skyra Creations runway training and showcase event registrations.',
    canonicalPath: '/payment',
    noindex: false,
  },
  balance: {
    title: 'Registration Fee Clearance | Skyra Creations',
    description: 'Complete your runway show registration fee clearance securely for upcoming Skyra Creations events.',
    canonicalPath: '/balance',
    noindex: false,
  },
  status: {
    title: 'Registration Verification & Runway Pass | Skyra Creations',
    description: 'Track your runway model registration verification status and access your official digital credential pass.',
    canonicalPath: '/status',
    noindex: false,
  },
  admin: {
    title: 'Admin Operations Portal | Skyra Creations',
    description: 'Restricted administrative dashboard for Skyra Creations runway training and event operations.',
    canonicalPath: '/admin',
    noindex: true,
  },
  'not-found': {
    title: 'Page Not Found | Skyra Creations',
    description: 'The requested page could not be found on Skyra Creations.',
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

  // 6. Update Twitter Card Metadata
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', config.title);

  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', config.description);
}
