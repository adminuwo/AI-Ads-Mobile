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
  // If logo is a raster Data URL (e.g. converted from SVG), return it immediately
  if (params.logoUrl && params.logoUrl.startsWith('data:image/')) {
    return params.logoUrl;
  }

  // If logo is an SVG network URL, native mobile <Image> cannot decode it directly.
  // Fall back to a raster format (raster favicon or Google Favicon PNG).
  if (params.logoUrl && params.logoUrl.toLowerCase().includes('.svg')) {
    if (params.faviconUrl && !params.faviconUrl.toLowerCase().includes('.svg') && (params.faviconUrl.startsWith('http') || params.faviconUrl.startsWith('data:image/'))) {
      return params.faviconUrl;
    }
    const rawUrl = params.domainUrl || params.brandName || '';
    if (rawUrl) {
      let domain = rawUrl.trim().toLowerCase().replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0].split('?')[0];
      if (!domain.includes('.')) domain = `${domain.replace(/\s+/g, '')}.com`;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`;
    }
  }

  if (params.logoUrl && params.logoUrl.startsWith('http')) {
    return params.logoUrl;
  }

  if (params.faviconUrl && !params.faviconUrl.toLowerCase().includes('.svg') && params.faviconUrl.startsWith('http')) {
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
