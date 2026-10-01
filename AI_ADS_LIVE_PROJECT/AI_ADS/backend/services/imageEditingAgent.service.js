/**
 * imageEditingAgent.service.js
 *
 * Image Editing Agent for Custom Strategy Posts.
 *
 * Goal: Generate PREMIUM COMMERCIAL ADVERTISING IMAGES like magazine editorials
 * where the user's uploaded reference product is the MAIN HERO of the scene.
 *
 * Two-Step Approach:
 * ─────────────────
 * STEP A — Product Analysis + Scene Builder (Gemini text model, multimodal):
 *   • Receives: reference image (base64) + brand context + visual directive
 *   • TWO sub-steps:
 *     1. Analyze the product in extreme detail (color, material, texture, shape, logo, distinctive features)
 *     2. Build a premium commercial advertising scene prompt placing that product as the hero
 *   • Output: A richly detailed, professional image generation prompt (logged to terminal)
 *
 * STEP B — Multi-Model Image Generation & GCS Storage:
 *   • Tries robust candidate image models (imagen-3.0-generate-002, imagen-3.0-fast-generate-001, gemini-2.5-flash)
 *   • Generates a brand-aligned premium commercial advertising image
 *   • Uploads to Google Cloud Storage (GCS) bucket and returns V4 signed URL
 *
 * Works for ALL brands and products universally.
 */

const { aiClient, globalAiClient } = require('../config/vertex');
const { uploadImageBufferToGcs } = require('./gcsStorageService');
const Workspace = require('../models/Workspace');
const BrandProfile = require('../models/BrandProfile');
const { inferBrandColors, generateBrand3DSvg } = require('./brandImageAgent.service');
const axios = require('axios');

/**
 * Fetch an image from a URL and return as base64 + mimeType.
 * Supports both external URLs and data URIs.
 */
async function fetchImageAsBase64(imageUrl) {
  if (!imageUrl) return null;

  if (imageUrl.startsWith('data:')) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) return { mimeType: match[1], base64: match[2] };
    return null;
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 25000,
      headers: { 'User-Agent': 'AI-Ads-ImageEditingAgent/3.0' }
    });
    const mimeType = response.headers['content-type']?.split(';')[0] || 'image/jpeg';
    const base64 = Buffer.from(response.data).toString('base64');
    return { mimeType, base64 };
  } catch (err) {
    console.warn('[ImageEditingAgent] Could not fetch reference image:', err.message);
    return null;
  }
}

/**
 * STEP A — Sub-step 1: Analyze the product in the reference image in detail.
 */
async function analyzeProductFromImage(client, referenceImageBase64, referenceImageMime) {
  if (!referenceImageBase64 || !referenceImageMime) return null;

  const candidateTextModels = ['gemini-3.5-flash'];

  for (const modelName of candidateTextModels) {
    try {
      const result = await client.models.generateContent({
        model: modelName,
        contents: [{
          role: 'user',
          parts: [
            {
              text: `You are a professional product analyst and art director.
Analyze this product image in extreme detail for use in a commercial advertising photoshoot.

Describe EXACTLY:
1. What the product IS (type, category, primary purpose)
2. Physical appearance: exact colors, materials, textures, finish (matte/glossy/metallic)
3. Shape, size, form factor
4. Any logos, patterns, stitching, hardware, or distinctive design elements
5. Overall aesthetic/style (luxury, sporty, minimalist, artisan, etc.)

Be very precise and specific. Output as a concise factual paragraph (3-5 sentences). No preamble.`
            },
            {
              inlineData: {
                mimeType: referenceImageMime,
                data: referenceImageBase64
              }
            }
          ]
        }],
        config: { maxOutputTokens: 300, temperature: 0.3 }
      });

      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (text.length > 20) {
        console.log(`[ImageEditingAgent] Product analysis succeeded using model "${modelName}"`);
        return text;
      }
    } catch (err) {
      console.warn(`[ImageEditingAgent] Product analysis model "${modelName}" note:`, err.message);
    }
  }

  return null;
}

/**
 * STEP A — Sub-step 2: Build the premium commercial advertising scene prompt.
 */
async function buildCommercialAdScenePrompt(client, {
  productDescription,
  visualDirective,
  topic,
  brandName,
  brandColors,
  industry,
  tagline,
  companyDescription,
  platform,
  aspect
}) {
  const colorsList = (brandColors && brandColors.length > 0)
    ? brandColors.join(', ')
    : '';

  const aspectLabel = aspect === '9:16' ? 'vertical portrait format (9:16 story/reel)' :
    aspect === '16:9' ? 'wide landscape widescreen format (16:9)' :
    aspect === '4:5' ? 'portrait social format (4:5)' : 'square social format (1:1)';

  const platformLabel = (platform || 'Instagram').charAt(0).toUpperCase() + (platform || 'Instagram').slice(1);

  const contextText = `${brandName} ${industry || ''} ${companyDescription || ''} ${topic || ''} ${visualDirective || ''}`.toLowerCase();
  
  let sceneStyleHint = '';
  if (/fashion|apparel|clothing|luxury|bag|handbag|wallet|shoes|accessories|jewelry|watch|perfume|cosmetic|beauty|makeup|skincare/i.test(contextText)) {
    sceneStyleHint = `Set the product in an elegant lifestyle scene — a sunlit café terrace, marble vanity, or luxurious boutique environment. Add tasteful props like flowers, champagne, silk scarves, or fine china. Use warm golden-hour or diffused natural window lighting. The scene should feel like a high-end fashion editorial in Vogue or Harper's Bazaar.`;
  } else if (/food|drink|beverage|coffee|tea|sauce|snack|restaurant|bakery|chocolate|wine|whiskey|spirits/i.test(contextText)) {
    sceneStyleHint = `Set the product in a premium food photography scene — rustic wood surface, marble countertop, or elegant plating setup. Add complementary ingredients, garnishes, or lifestyle props. Use warm, diffused natural lighting with beautiful bokeh background. The scene should feel like a premium food magazine spread.`;
  } else if (/tech|electronics|gadget|phone|laptop|software|saas|app|device|headphone|camera|gaming/i.test(contextText)) {
    sceneStyleHint = `Set the product on a sleek minimalist desk or glass surface with subtle ambient glow. Add clean tech props (cable, notebook, plant). Use soft studio lighting with a blurred modern office or city window background. The scene should feel like an Apple or Sony premium product launch.`;
  } else if (/fitness|sport|gym|health|wellness|yoga|outdoor|running|cycling|athletic/i.test(contextText)) {
    sceneStyleHint = `Set the product in a dynamic lifestyle scene — a bright minimalist gym, outdoor trail, or clean studio. Use motivational props and dramatic directional lighting. The scene should feel like a Nike or Adidas editorial campaign.`;
  } else if (/home|decor|furniture|interior|candle|plant|kitchenware|bedding|gift|hamper/i.test(contextText)) {
    sceneStyleHint = `Set the product in a beautifully styled home interior scene with warm ambient lighting. Add complementary home decor props, fresh flowers, or seasonal elements. The scene should feel like a premium Anthropologie or IKEA editorial.`;
  } else {
    sceneStyleHint = `Set the product center-stage in a premium commercial advertising environment. Use beautiful props that complement the product category, soft directional studio lighting with natural warmth, and a shallow-depth bokeh background that keeps full focus on the product. The scene should feel like a premium editorial advertisement.`;
  }

  const systemPrompt = `You are an award-winning commercial advertising art director and photographer.
Your task: Create a single, masterfully crafted image generation prompt for a premium commercial ad.

The prompt MUST:
1. Place the described product as the ABSOLUTE HERO and center-focal-point of the scene
2. Describe a complete, beautiful commercial advertising scene with atmospheric props and environment
3. Specify professional photography details: lens, lighting type, depth of field, composition
4. Feel like a real magazine editorial or premium brand campaign — not a simple product photo
5. Use photorealistic commercial photography language
6. Be highly specific about colors, textures, atmosphere, and spatial arrangement
7. NOT include any text overlays, logos, watermarks, or typography instructions

Output ONLY the final image generation prompt as a single paragraph (5-8 sentences). No labels, no preamble.`;

  const userPrompt = `Create a premium commercial advertising image generation prompt for this product.

PRODUCT DETAILS:
${productDescription || 'A premium branded product'}

BRAND CONTEXT:
Brand: ${brandName}${tagline ? ` — "${tagline}"` : ''}
${industry ? `Industry: ${industry}` : ''}
${companyDescription ? `About: ${companyDescription}` : ''}
${colorsList ? `Brand Color Palette: ${colorsList}` : ''}

CAMPAIGN DIRECTIVE:
${visualDirective || topic}

SCENE STYLE DIRECTION:
${sceneStyleHint}

FORMAT: ${platformLabel} ad | ${aspectLabel}

CRITICAL RULES:
- The product must be physically PRESENT as the primary subject (not represented abstractly)
- Describe exact scene: what surface the product rests on, what's in the background (blurred/bokeh), what props surround it
- Specify the lighting: golden hour, soft diffused daylight, rim lighting, studio lights, etc.
- Specify camera: 85mm portrait lens, 50mm prime, macro close-up, etc.
- End with photography quality cues: "8K resolution, photorealistic, commercial product photography, Hasselblad H6D-100c quality, no rendered text, no artificial logos"`;

  const candidateTextModels = ['gemini-3.5-flash'];

  for (const modelName of candidateTextModels) {
    try {
      const result = await client.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: `SYSTEM:\n${systemPrompt}` }] },
          { role: 'model', parts: [{ text: 'Understood. I will create a masterfully crafted commercial advertising image generation prompt.' }] },
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        config: { maxOutputTokens: 500, temperature: 0.7 }
      });

      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (text.length > 50) {
        console.log(`[ImageEditingAgent] Commercial ad scene prompt built using model "${modelName}"`);
        return text;
      }
    } catch (err) {
      console.warn(`[ImageEditingAgent] Scene builder model "${modelName}" note:`, err.message);
    }
  }

  return null;
}

/**
 * Fallback prompt if AI scene builder is unavailable
 */
function craftFallbackPrompt({ brandName, colorsList, topic, visualDirective, platform, aspect, industry, tagline }) {
  const cleanBrand = (brandName || 'Brand').trim();
  const colorsText = colorsList ? `brand color harmony (${colorsList}), ` : '';
  const aspectLabel = aspect === '9:16' ? '9:16 vertical storytelling format' : aspect === '16:9' ? '16:9 widescreen format' : '1:1 square ratio';

  return `Commercial advertising studio setup for ${cleanBrand}, highlighting ${visualDirective || topic}, modern architectural interior, ${colorsText}subtle ambient lighting, pristine focus, premium commercial ad aesthetic, cinematic wide editorial scene with rich depth of field, authentic brand essence of ${cleanBrand} ("${tagline || 'Premium Quality'}"), ${aspectLabel}, commercial advertising photography, 8k resolution, photorealistic, professional studio lighting, Hasselblad H6D-100c, masterwork, clean commercial photography, no rendered text, no fake logos, no artificial typography, no watermarks`;
}

/**
 * Run the Image Editing Agent
 */
async function runImageEditingAgent({
  workspaceId,
  referenceImageUrl,
  visualDirective,
  topic,
  brandName = 'Brand',
  brandColors = [],
  industry = '',
  tagline = '',
  companyDescription = '',
  platform = 'instagram',
  style = 'Photorealistic Commercial',
  aspect = '1:1'
}) {
  // ── 1. DB context loading ──────────────────────────────────────────────────
  if (workspaceId) {
    try {
      const ws = await Workspace.findById(workspaceId);
      if (ws) {
        brandName = brandName || ws.brandName || 'Brand';
        brandColors = (brandColors && brandColors.length > 0) ? brandColors : (ws.brandColors || []);
        industry = industry || ws.industryCategory || ws.niche || '';
        companyDescription = companyDescription || ws.metaDescription || ws.positioningSummary || '';
      }
      const bp = await BrandProfile.findOne({ workspaceId });
      if (bp) {
        tagline = tagline || bp.tagline || '';
        industry = industry || bp.industry || '';
        companyDescription = companyDescription || bp.companyDescription || '';
      }
    } catch (e) {
      console.warn('[ImageEditingAgent] DB context load note:', e.message);
    }
  }

  brandColors = (brandColors && brandColors.length > 0) ? brandColors : inferBrandColors(brandName, companyDescription);
  const colorsList = brandColors.join(', ');

  // ── 2. Fetch reference image as base64 ────────────────────────────────────
  let referenceImageBase64 = null;
  let referenceImageMime = null;

  if (referenceImageUrl) {
    const imgData = await fetchImageAsBase64(referenceImageUrl);
    if (imgData) {
      referenceImageBase64 = imgData.base64;
      referenceImageMime = imgData.mimeType;
      console.log(`[ImageEditingAgent] ✅ Reference image loaded (${Math.round(referenceImageBase64.length * 0.75 / 1024)} KB, ${referenceImageMime})`);
    } else {
      console.warn('[ImageEditingAgent] ⚠️ Could not load reference image — proceeding with text-only prompting.');
    }
  }

  // ── 3. STEP A: Two-pass scene generation ──────────────────────────────────
  console.log('\n==================================================');
  console.log('🤖 [IMAGE EDITING AGENT] Starting Creative Ad Generation...');
  console.log('==================================================');
  console.log(`Brand: "${brandName}" | Platform: ${platform} | Aspect: ${aspect}`);
  console.log(`Campaign Directive: "${visualDirective || topic}"`);
  if (referenceImageUrl) console.log(`Reference: ${referenceImageUrl.slice(0, 80)}...`);
  console.log('==================================================\n');

  const client = globalAiClient || aiClient;
  let finalScenePrompt = null;

  if (client) {
    // Sub-step 1: Analyze product in the reference image
    let productDescription = null;
    if (referenceImageBase64 && referenceImageMime) {
      console.log('[ImageEditingAgent] Step A1: Analyzing product in reference image...');
      productDescription = await analyzeProductFromImage(client, referenceImageBase64, referenceImageMime);
      if (productDescription) {
        console.log('[ImageEditingAgent] ✅ Product Analysis:', productDescription.slice(0, 120) + '...');
      }
    }

    // Sub-step 2: Build commercial advertising scene prompt
    console.log('[ImageEditingAgent] Step A2: Building commercial ad scene prompt...');
    finalScenePrompt = await buildCommercialAdScenePrompt(client, {
      productDescription,
      visualDirective,
      topic,
      brandName,
      brandColors,
      industry,
      tagline,
      companyDescription,
      platform,
      aspect
    });
  }

  if (!finalScenePrompt) {
    console.warn('[ImageEditingAgent] Using enhanced fallback prompt.');
    finalScenePrompt = craftFallbackPrompt({ brandName, colorsList, topic, visualDirective, platform, aspect, industry, tagline });
  }

  console.log('\n==================================================');
  console.log('🎨 [IMAGE EDITING AGENT] Final Commercial Ad Prompt:');
  console.log('==================================================');
  console.log(`Prompt: "${finalScenePrompt}"`);
  console.log('==================================================\n');

  // ── 4. STEP B: Generate image using candidate model chain & upload to GCS ───
  let imageUrl = '';
  let gcsPath = null;
  let engineUsed = 'Multi-Model Pipeline';

  const candidateImageModels = [
    'gemini-3.1-flash-image'
  ];

  if (client) {
    for (const modelName of candidateImageModels) {
      if (imageUrl) break;
      try {
        console.log(`[ImageEditingAgent] Step B: Trying model "${modelName}" for "${brandName}"...`);
        let imageBuffer = null;
        let mime = 'image/png';

        // Strategy 1: Try client.models.generateImages if present
        if (typeof client.models?.generateImages === 'function') {
          try {
            const imgRes = await client.models.generateImages({
              model: modelName,
              prompt: finalScenePrompt,
              config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspect === '9:16' ? '9:16' : aspect === '16:9' ? '16:9' : aspect === '4:5' ? '4:5' : '1:1'
              }
            });
            const bytesBase64 = imgRes?.generatedImages?.[0]?.image?.imageBytes;
            if (bytesBase64) {
              imageBuffer = Buffer.from(bytesBase64, 'base64');
            }
          } catch (genImgErr) {
            console.warn(`[ImageEditingAgent] generateImages note for ${modelName}:`, genImgErr.message);
          }
        }

        // Strategy 2: Try client.models.generateContent if generateImages didn't produce a buffer
        if (!imageBuffer && typeof client.models?.generateContent === 'function') {
          const vertexRes = await client.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: finalScenePrompt }] }],
            config: { responseModalities: ['IMAGE'] }
          });
          const parts = vertexRes?.candidates?.[0]?.content?.parts || [];
          for (const p of parts) {
            if (p.inlineData?.data) {
              mime = p.inlineData.mimeType || 'image/png';
              imageBuffer = Buffer.from(p.inlineData.data, 'base64');
              break;
            }
          }
        }

        if (imageBuffer && imageBuffer.length > 0) {
          console.log(`[ImageEditingAgent] ✅ Image generated from model "${modelName}" (${imageBuffer.length} bytes). Uploading to GCP Bucket...`);

          try {
            const brandSlug = brandName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
            const gcsRes = await uploadImageBufferToGcs({
              buffer: imageBuffer,
              mimeType: mime,
              folder: `ai-ads-creatives/${brandSlug}/custom-strategy`
            });

            if (gcsRes?.url) {
              imageUrl = gcsRes.url;
              gcsPath = gcsRes.gcsPath;
              engineUsed = `${modelName} (GCS V4 Signed URL)`;
              console.log(`\n==================================================`);
              console.log(`☁️ [GCS UPLOAD SUCCESSFUL]`);
              console.log(`Bucket Path: ${gcsPath}`);
              console.log(`Signed URL:  ${imageUrl.slice(0, 100)}...`);
              console.log(`==================================================\n`);
            }
          } catch (gcsErr) {
            console.error('⚠️ [ImageEditingAgent] GCS Bucket Upload Failed:', gcsErr.message);
            imageUrl = `data:${mime};base64,${imageBuffer.toString('base64')}`;
            engineUsed = `${modelName} (Direct Base64 Fallback)`;
          }
        }
      } catch (modelErr) {
        console.warn(`[ImageEditingAgent] Model "${modelName}" execution note:`, modelErr.message);
      }
    }
  }

  // ── 5. SVG Fallback ───────────────────────────────────────────────────────
  const svgFallback = generateBrand3DSvg({
    brandName,
    brandColors,
    topic: topic || visualDirective || 'Custom Strategy Campaign',
    style,
    aspect
  });

  if (!imageUrl) {
    console.warn('[ImageEditingAgent] No model generated a binary image. Using SVG brand fallback.');
    imageUrl = svgFallback;
    engineUsed = 'SVG Brand Fallback';
  }

  return {
    success: true,
    imageUrl,
    gcsPath,
    imagePrompt: finalScenePrompt,
    imageStyle: style,
    imageAspect: aspect,
    brandName,
    brandColors,
    engine: engineUsed,
    svgFallback,
    createdAt: new Date().toISOString()
  };
}

module.exports = { runImageEditingAgent };
