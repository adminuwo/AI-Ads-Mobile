/**
 * brandVisualResolver.js
 * Universal High-Resolution Prompt-Matched Visual Asset Engine
 * Resolves high-fidelity photography and synthesized branded 3D visual creatives
 * matching brand name, topic, style, and platform aspect ratios with 0 latency.
 */

// Curated Category Image Pools (High-Resolution Unsplash & Pexels CDN)
const BRAND_VISUAL_POOLS = {
  BUS_TRAVEL_TRANSIT: [
    {
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      title: 'Modern Luxury Coach on Highway',
      style: 'Photorealistic Commercial'
    },
    {
      url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
      title: 'Passenger Coach Travel Experience',
      style: 'Cinematic Film Studio'
    },
    {
      url: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80',
      title: 'Happy Traveler Booking on Smartphone App',
      style: 'Vibrant Social Ad'
    },
    {
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      title: 'Customer Case Study & Business Growth Meeting',
      style: 'Minimalist Editorial'
    },
    {
      url: 'https://images.unsplash.com/photo-1556742049-0a67c5576a8d?auto=format&fit=crop&w=1200&q=80',
      title: 'Satisfied Customer 5-Star Service Proof',
      style: 'Photorealistic Commercial'
    },
    {
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
      title: 'Global Travel & Fast Departure Hub',
      style: 'Luxury Brand Studio'
    }
  ],
  TECH_SAAS_MOBILE: [
    {
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      title: 'Enterprise Analytics Growth Dashboard',
      style: 'Photorealistic Commercial'
    },
    {
      url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80',
      title: 'Seamless Mobile Application Checkout',
      style: 'Vibrant Social Ad'
    },
    {
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      title: 'Digital Marketing Performance Metrics',
      style: 'Minimalist Editorial'
    },
    {
      url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
      title: 'Modern High-Tech Office Workspace',
      style: 'Cinematic Film Studio'
    }
  ],
  ECOMMERCE_RETAIL: [
    {
      url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
      title: 'Curated Consumer Retail Experience',
      style: 'Photorealistic Commercial'
    },
    {
      url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=80',
      title: 'Luxury Brand Collection Showcase',
      style: 'Luxury Brand Studio'
    }
  ],
  FOOD_DINING: [
    {
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      title: 'Artisan Gourmet Culinary Plate',
      style: 'Photorealistic Commercial'
    },
    {
      url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80',
      title: 'Traditional Sweets & Gifting Hamper',
      style: 'Luxury Brand Studio'
    }
  ],
  GENERAL_BUSINESS: [
    {
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      title: 'Strategic Growth & Authority Keynote',
      style: 'Photorealistic Commercial'
    },
    {
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      title: 'High-Impact Brand Strategy Workshop',
      style: 'Vibrant Social Ad'
    }
  ]
};

/**
 * Infer the primary visual domain from prompt, brand name, and topic
 */
export function detectVisualDomain(prompt = '', brand = '', topic = '') {
  const text = `${prompt} ${brand} ${topic}`.toLowerCase();

  if (/redbus|bus|coach|travel|trip|transit|commute|passenger|ticket|booking|route|highway|tour/i.test(text)) {
    return 'BUS_TRAVEL_TRANSIT';
  }
  if (/app|mobile|smartphone|software|saas|digital|platform|tech|ai|cloud|dashboard|code/i.test(text)) {
    return 'TECH_SAAS_MOBILE';
  }
  if (/food|sweet|restaurant|dining|snack|namkeen|kaju|culinary|chef|bistro/i.test(text)) {
    return 'FOOD_DINING';
  }
  if (/retail|ecommerce|shop|product|store|order|delivery|package/i.test(text)) {
    return 'ECOMMERCE_RETAIL';
  }
  return 'GENERAL_BUSINESS';
}

/**
 * Generate a high-end, responsive SVG data URI for 3D glassmorphic & branded artwork
 */
export function generateBranded3DSvg({ brand = 'Redbus', topic = 'Customer Case Studies & Proof', style = 'Glassmorphic Modern 3D', aspect = '1:1' }) {
  const bName = brand || 'Redbus';
  const displayTopic = topic.length > 50 ? topic.slice(0, 47) + '...' : topic;
  const is916 = aspect === '9:16';
  const is169 = aspect === '16:9';

  const width = is169 ? 1280 : is916 ? 720 : 1080;
  const height = is169 ? 720 : is916 ? 1280 : 1080;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A"/>
        <stop offset="50%" stop-color="#1E1B4B"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="redbusAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D84E55"/>
        <stop offset="50%" stop-color="#E53935"/>
        <stop offset="100%" stop-color="#FF5252"/>
      </linearGradient>
      <linearGradient id="glassBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.4)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0.05)"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>

    <!-- Ambient Glowing Orbs -->
    <circle cx="${width * 0.2}" cy="${height * 0.25}" r="${width * 0.3}" fill="#D84E55" opacity="0.25" filter="url(#glow)"/>
    <circle cx="${width * 0.8}" cy="${height * 0.75}" r="${width * 0.35}" fill="#6366F1" opacity="0.2" filter="url(#glow)"/>

    <!-- Decorative Top Header / Brand Badge -->
    <g transform="translate(${width * 0.08}, ${height * 0.08})">
      <rect width="220" height="46" rx="23" fill="rgba(255,255,255,0.08)" stroke="url(#glassBorder)" stroke-width="1.5"/>
      <circle cx="28" cy="23" r="10" fill="#D84E55"/>
      <text x="50" y="28" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="14" font-weight="900" letter-spacing="2">${bName.toUpperCase()}</text>
    </g>

    <g transform="translate(${width * 0.65}, ${height * 0.08})">
      <rect width="180" height="46" rx="23" fill="rgba(216,78,85,0.15)" stroke="#D84E55" stroke-width="1.5"/>
      <text x="90" y="28" fill="#FF8A80" font-family="'Inter', -apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="middle">VERIFIED CASE STUDY</text>
    </g>

    <!-- Center 3D Glassmorphic Card -->
    <g filter="url(#dropShadow)" transform="translate(${width * 0.08}, ${height * 0.2})">
      <rect width="${width * 0.84}" height="${height * 0.62}" rx="32" fill="rgba(30, 41, 59, 0.75)" stroke="url(#glassBorder)" stroke-width="2"/>
      
      <!-- Inner Headline Container -->
      <rect x="36" y="36" width="${width * 0.84 - 72}" height="100" rx="20" fill="rgba(255,255,255,0.04)"/>
      <text x="60" y="74" fill="#94A3B8" font-family="'Inter', -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="2">STRATEGIC PROOF &amp; IMPACT</text>
      <text x="60" y="108" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="${is916 ? '20' : '26'}" font-weight="900">${displayTopic}</text>

      <!-- Key Performance Metric Cards -->
      <g transform="translate(36, 160)">
        <rect width="${(width * 0.84 - 96) / 3}" height="120" rx="20" fill="rgba(216,78,85,0.15)" stroke="#D84E55" stroke-width="1"/>
        <text x="24" y="44" fill="#FF8A80" font-family="'Inter', -apple-system, sans-serif" font-size="12" font-weight="800">CUSTOMER TRUST</text>
        <text x="24" y="86" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="28" font-weight="900">4.9 / 5</text>
        <text x="24" y="106" fill="#94A3B8" font-family="'Inter', -apple-system, sans-serif" font-size="11" font-weight="600">★★★★★ Verified</text>
      </g>

      <g transform="translate(${36 + (width * 0.84 - 96) / 3 + 12}, 160)">
        <rect width="${(width * 0.84 - 96) / 3}" height="120" rx="20" fill="rgba(99,102,241,0.15)" stroke="#818CF8" stroke-width="1"/>
        <text x="24" y="44" fill="#A5B4FC" font-family="'Inter', -apple-system, sans-serif" font-size="12" font-weight="800">SCALE &amp; REACH</text>
        <text x="24" y="86" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="28" font-weight="900">10M+</text>
        <text x="24" y="106" fill="#94A3B8" font-family="'Inter', -apple-system, sans-serif" font-size="11" font-weight="600">Happy Travelers</text>
      </g>

      <g transform="translate(${36 + ((width * 0.84 - 96) / 3) * 2 + 24}, 160)">
        <rect width="${(width * 0.84 - 96) / 3}" height="120" rx="20" fill="rgba(16,185,129,0.15)" stroke="#34D399" stroke-width="1"/>
        <text x="24" y="44" fill="#6EE7B7" font-family="'Inter', -apple-system, sans-serif" font-size="12" font-weight="800">ON-TIME RATE</text>
        <text x="24" y="86" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="28" font-weight="900">99.4%</text>
        <text x="24" y="106" fill="#94A3B8" font-family="'Inter', -apple-system, sans-serif" font-size="11" font-weight="600">Seamless Journeys</text>
      </g>

      <!-- Customer Quote Banner inside Card -->
      <g transform="translate(36, 310)">
        <rect width="${width * 0.84 - 72}" height="110" rx="20" fill="rgba(255,255,255,0.06)" stroke="url(#glassBorder)" stroke-width="1"/>
        <text x="28" y="42" fill="#E2E8F0" font-family="'Inter', -apple-system, sans-serif" font-size="14" font-weight="600" font-style="italic">
          "Booking with ${bName} delivered seamless reliability and complete peace of mind across our trip."
        </text>
        <circle cx="42" cy="80" r="14" fill="#D84E55"/>
        <text x="42" y="85" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="12" font-weight="900" text-anchor="middle">✓</text>
        <text x="68" y="84" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="13" font-weight="800">Verified Consumer Experience · 2026 Customer Spotlight</text>
      </g>
    </g>

    <!-- Bottom Action CTA Banner -->
    <g transform="translate(${width * 0.08}, ${height * 0.86})">
      <rect width="${width * 0.84}" height="64" rx="20" fill="url(#redbusAccent)"/>
      <text x="${(width * 0.84) / 2}" y="39" fill="#FFFFFF" font-family="'Inter', -apple-system, sans-serif" font-size="16" font-weight="900" letter-spacing="1" text-anchor="middle">
        EXPERIENCE SEAMLESS BOOKING WITH ${bName.toUpperCase()} →
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Universal Brand Visual Generator
 * Resolves the ideal visual asset based on topic, brand, style, and aspect ratio.
 */
export function resolveBrandVisualAsset({
  prompt = '',
  brandName = 'Redbus',
  topic = 'Customer Case Studies & Proof',
  style = 'Photorealistic Commercial',
  aspect = '1:1',
  variationIndex = 0
}) {
  const cleanBrand = brandName || 'Redbus';
  const cleanTopic = topic || prompt || 'Marketing Campaign';

  // If user selected Glassmorphic 3D or custom styled graphic
  if (style === 'Glassmorphic Modern 3D') {
    return generateBranded3DSvg({ brand: cleanBrand, topic: cleanTopic, style, aspect });
  }

  // Detect domain for photography selection
  const domain = detectVisualDomain(prompt, cleanBrand, cleanTopic);
  const pool = BRAND_VISUAL_POOLS[domain] || BRAND_VISUAL_POOLS.GENERAL_BUSINESS;

  // Filter pool matching style if possible, or cycle through variations
  let matchingItems = pool.filter(item => item.style.toLowerCase() === style.toLowerCase());
  if (matchingItems.length === 0) matchingItems = pool;

  const selectedItem = matchingItems[Math.abs(variationIndex) % matchingItems.length] || pool[0];

  // Adjust aspect ratio parameters on the Unsplash URL
  const is916 = aspect === '9:16';
  const is169 = aspect === '16:9';
  const is45 = aspect === '4:5';

  const w = is169 ? 1280 : is916 ? 720 : is45 ? 1080 : 1080;
  const h = is169 ? 720 : is916 ? 1280 : is45 ? 1350 : 1080;

  const baseCleanUrl = selectedItem.url.split('&w=')[0].split('?')[0];
  const finalUrl = `${baseCleanUrl}?auto=format&fit=crop&w=${w}&h=${h}&q=85`;

  return finalUrl;
}
