/**
 * Brand Logo & Favicon Resolver
 * Resolves brand logos with high-resolution Google Favicon fallback,
 * identical to the web platform behavior.
 */

interface BrandLogoParams {
  brandName?: string;
  domainUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export const getBrandLogoUrl = (params: BrandLogoParams): string => {
  if (params.logoUrl && params.logoUrl.startsWith('http')) {
    return params.logoUrl;
  }

  if (params.faviconUrl && params.faviconUrl.startsWith('http')) {
    return params.faviconUrl;
  }

  const rawUrl = params.domainUrl || params.brandName || '';
  if (!rawUrl) {
    return 'https://www.google.com/s2/favicons?domain=aiads.com&sz=128';
  }

  // Extract pure hostname
  let domain = rawUrl.trim().toLowerCase();
  domain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '');
  domain = domain.split('/')[0].split('?')[0];

  if (!domain.includes('.')) {
    domain = `${domain.replace(/\s+/g, '')}.com`;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
};
