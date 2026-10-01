/**
 * Formatters for Date, Currency, and Text Stripping
 */

export const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export const formatCurrency = (amount: number, currency: 'INR' | 'USD' = 'INR'): string => {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

/**
 * Strips raw markdown asterisks, hashtags, and formatting characters
 * for clean, ultra-readable display on mobile cards.
 */
export const cleanText = (text?: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\\n/g, '\n')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')
    .replace(/_{1,3}(.*?)_{1,3}/g, '$1')
    .replace(/`{1,3}(.*?)/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/AISA\\u2122/g, 'AI Ads™')
    .replace(/\\u2122/g, '™')
    .trim();
};
