export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
}

export const SEO_CONFIGS: Record<string, PageSeoConfig> = {
  register: {
    title: 'SKYRA CREATIONS | Fashion Shows & Model Registration',
    description: 'Discover fashion shows, runway opportunities, modelling auditions and designer showcases with SKYRA CREATIONS. Explore upcoming events and register online.',
    canonicalPath: '/',
    noindex: false,
  },
  balance: {
    title: 'Complete Your Event Payment | SKYRA CREATIONS Balance Payment Portal',
    description: 'Already registered for the Runway Show 2026? Submit your installment payment securely towards your outstanding registration balance.',
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
