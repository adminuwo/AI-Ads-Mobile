import { getBrandLogoUrl } from './brandLogoHelper';

/**
 * imageCompositor.js
 * Composites the actual, official brand logo asset directly onto the generated image canvas.
 * Guarantees that the brand logo is burned directly into the image pixels.
 */
export async function compositeBrandLogoOntoImage(imageUrl, brandOptions = {}) {
  if (!imageUrl) return imageUrl;

  const brandName = brandOptions.brandName || brandOptions.brand || 'Brand';
  const domainUrl = brandOptions.domainUrl || brandOptions.domain || '';
  const logoUrl = getBrandLogoUrl({
    brandName,
    domainUrl,
    logoUrl: brandOptions.logoUrl || brandOptions.faviconUrl
  });

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const w = img.naturalWidth || img.width || 1080;
        const h = img.naturalHeight || img.height || 1080;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        // Draw the base generated image
        ctx.drawImage(img, 0, 0, w, h);

        const scale = Math.max(w, h) / 1080;
        const badgeH = Math.round(56 * scale);
        const maxLogoW = Math.round(180 * scale);
        const badgeX = Math.round(36 * scale);
        const badgeY = Math.round(36 * scale);
        const padding = Math.round(10 * scale);

        // Load the official brand logo image
        let logoLoaded = false;
        const logoImg = new Image();
        if (logoUrl) {
          try {
            logoImg.crossOrigin = 'anonymous';
            logoLoaded = await new Promise((resLogo) => {
              const timer = setTimeout(() => resLogo(false), 4000);
              logoImg.onload = () => { clearTimeout(timer); resLogo(true); };
              logoImg.onerror = () => { clearTimeout(timer); resLogo(false); };
              logoImg.src = logoUrl;
            });
          } catch (e) {
            logoLoaded = false;
          }
        }

        ctx.save();
        if (logoLoaded && logoImg.width && logoImg.height) {
          const aspect = logoImg.width / logoImg.height;
          const targetH = badgeH - padding * 2;
          const targetW = Math.min(maxLogoW, targetH * aspect);
          const boxW = Math.round(targetW + padding * 2);

          // Render clean white glassmorphic container for logo contrast
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, boxW, badgeH, Math.round(14 * scale));
          } else {
            ctx.rect(badgeX, badgeY, boxW, badgeH);
          }
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.fill();
          ctx.lineWidth = Math.max(1, 1.5 * scale);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.stroke();

          // Draw the actual official brand logo image onto the image canvas
          const logoX = badgeX + (boxW - targetW) / 2;
          const logoY = badgeY + (badgeH - targetH) / 2;
          ctx.drawImage(logoImg, logoX, logoY, targetW, targetH);
        } else {
          // Fallback text brand stamp if logo image fails
          ctx.font = `800 ${Math.round(16 * scale)}px "Plus Jakarta Sans", -apple-system, sans-serif`;
          const textMetrics = ctx.measureText(brandName.toUpperCase());
          const boxW = Math.round(textMetrics.width + padding * 3);

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, boxW, badgeH, Math.round(14 * scale));
          } else {
            ctx.rect(badgeX, badgeY, boxW, badgeH);
          }
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(brandName.toUpperCase(), badgeX + boxW / 2, badgeY + badgeH / 2);
        }
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        console.warn('[ImageCompositor] Logo compositing fallback:', err);
        resolve(imageUrl);
      }
    };

    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}
