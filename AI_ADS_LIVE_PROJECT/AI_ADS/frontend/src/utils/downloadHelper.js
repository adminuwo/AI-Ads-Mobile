import { API_BASE } from '../config/api';
import { compositeBrandLogoOntoImage } from './imageCompositor';

/**
 * Triggers a file download directly to the user's device.
 * Ensures the official brand logo is embedded into the downloaded visual asset.
 */
export const downloadImageToDevice = async (imageUrl, defaultFilename = 'ai_ads_visual.jpg', brandOptions = {}) => {
  if (!imageUrl) return false;

  // Sanitize filename to ASCII for clean file system & header compliance
  const fileName = (defaultFilename || 'ai_ads_visual.jpg')
    .replace(/[^\x20-\x7E]/g, '') // remove non-ASCII characters like ™, ®, ©
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-\.]/g, '') || `ai_ads_visual_${Date.now()}.jpg`;

  /**
   * Internal Helper: Renders base image onto canvas with official brand logo and exports as JPEG data URL
   */
  const renderCanvasDataUrl = async (imgSrc) => {
    try {
      const composited = await compositeBrandLogoOntoImage(imgSrc, brandOptions);
      if (composited) return composited;
    } catch (e) {}

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width || 1080;
          const h = img.naturalHeight || img.height || 1080;
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } catch (err) {
          console.warn('Canvas generation failed:', err);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgSrc;
    });
  };

  const triggerDownloadFromUrl = (urlToDownload) => {
    const link = document.createElement('a');
    link.href = urlToDownload;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Strategy 1: Data URL (Base64) -> Direct anchor download
  if (imageUrl.startsWith('data:')) {
    try {
      const canvasUrl = await renderCanvasDataUrl(imageUrl);
      if (canvasUrl) {
        triggerDownloadFromUrl(canvasUrl);
        return true;
      }
      triggerDownloadFromUrl(imageUrl);
      return true;
    } catch (e) {
      console.warn('Data URL download error:', e);
    }
  }

  // Strategy 2: Same-Origin Backend Proxy Blob Download (Same-Origin blob link forces direct save to device)
  try {
    const apiBase = API_BASE || 'http://localhost:5000/api';
    const proxyUrl = `${apiBase}/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(fileName)}`;

    const response = await fetch(proxyUrl);
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      triggerDownloadFromUrl(blobUrl);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      return true;
    }
  } catch (e) {
    console.warn('Proxy blob fetch note:', e);
  }

  // Strategy 3: Hidden Iframe Direct Attachment Trigger (Prevents browser tab opening & forces save)
  try {
    const apiBase = API_BASE || 'http://localhost:5000/api';
    const proxyUrl = `${apiBase}/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(fileName)}`;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = proxyUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      try { document.body.removeChild(iframe); } catch(e){}
    }, 60000);
    return true;
  } catch (e) {
    console.error('All download methods failed:', e);
  }

  return false;
};
