/**
 * promptCraftingAgent.service.js
 * AGENT 1: Art Director Prompt Crafting Agent for Custom Strategy Posts
 *
 * Takes a specific custom strategy card topic, visual directive, hook, caption,
 * brand DNA parameters, and user reference product image.
 * Uses Gemini Vision & LLM to craft a high-resolution, master commercial ad
 * photography prompt incorporating the user's reference product image.
 */

const { aiClient, globalAiClient } = require('../config/vertex');
const axios = require('axios');

/**
 * Fetch reference image as base64 buffer for Gemini Vision analysis
 */
async function fetchImageAsBase64(imageUrl) {
  if (!imageUrl) return null;
  try {
    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) return { mimeType: match[1], data: match[2] };
    }
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 8000,
      headers: { 'User-Agent': 'AI-Ads-PromptCraftingAgent/1.0' }
    });
    const mimeType = response.headers['content-type']?.split(';')[0] || 'image/jpeg';
    const data = Buffer.from(response.data).toString('base64');
    return { mimeType, data };
  } catch (err) {
    console.warn('[PromptCraftingAgent] Note: Reference image fetch ignored:', err.message);
    return null;
  }
}

/**
 * Agent 1 Execution: Craft commercial image prompt based on card topic + reference image + brand DNA
 */
async function craftCardImagePrompt({
  topic = 'Brand Campaign',
  visualDirective = '',
  hook = '',
  caption = '',
  brandName = 'Brand',
  industry = '',
  tagline = '',
  companyDescription = '',
  brandColors = [],
  platform = 'instagram',
  style = 'Photorealistic Commercial',
  aspect = '1:1',
  referenceImageUrl = null
}) {
  const cleanBrand = (brandName || 'Brand').trim();
  const cleanIndustry = (industry || 'Consumer Products').trim();
  const colorsText = (brandColors && brandColors.length > 0) ? brandColors.join(', ') : '#6366F1, #8B5CF6';

  console.log('\n==================================================');
  console.log(`🎨 [AGENT 1: PROMPT CRAFTING AGENT] Processing Card Topic`);
  console.log('==================================================');
  console.log(`Brand: "${cleanBrand}" | Topic: "${topic}"`);
  console.log(`Platform: "${platform}" | Aspect: "${aspect}"`);
  console.log(`Reference Image: ${referenceImageUrl ? 'YES' : 'NONE'}`);
  console.log('==================================================\n');

  const clientCandidates = [globalAiClient, aiClient].filter(Boolean);

  if (clientCandidates.length > 0) {
    const client = clientCandidates[0];

    // Fetch reference image if present
    let imagePart = null;
    if (referenceImageUrl) {
      imagePart = await fetchImageAsBase64(referenceImageUrl);
    }

    const systemPrompt = `You are an award-winning Commercial Advertising Art Director and Master Photographer at AI Ads™.
Your task: Take the user's specific social media post topic, visual directive, and reference product image, and CRAFT A SINGLE HIGHLY DETAILED IMAGE GENERATION PROMPT for a commercial ad.

CRITICAL DIRECTIVES:
1. The product from the reference image MUST be described as the ABSOLUTE HERO and central focal point of the photoshoot.
2. Incorporate the card's specific topic ("${topic}") and visual guidance into a complete, atmospheric commercial advertising photoshoot scene.
3. Include photography details: Hasselblad H6D-100c camera, 85mm portrait lens, professional directional studio lighting, brand color palette accents (${colorsText}), and 8K photorealistic quality.
4. DO NOT include artificial text overlays, mangled typography, or fake logos in the image prompt.
5. Output ONLY the final image generation prompt as a single clear paragraph (3 to 6 sentences). No intro, no bullet points, no markdown formatting.`;

    const userPrompt = `Craft a commercial advertising photography prompt for this card:

CARD DETAILS:
- Topic / Headline: "${topic}"
- Visual Guidance: "${visualDirective || topic}"
- Hook Line: "${hook}"
- Caption Context: "${caption.slice(0, 200)}"

BRAND DNA:
- Brand Name: "${cleanBrand}"
- Industry: "${cleanIndustry}"
${tagline ? `- Tagline: "${tagline}"` : ''}
${companyDescription ? `- Description: "${companyDescription}"` : ''}
- Brand Colors: ${colorsText}
- Ad Format: ${platform} (${aspect})

Output the master image generation prompt now:`;

    const candidateModels = ['gemini-3.5-flash'];

    for (const modelName of candidateModels) {
      try {
        console.log(`[PromptCraftingAgent] Invoking model "${modelName}" for prompt crafting...`);
        const parts = [];
        if (imagePart) {
          parts.push({
            inlineData: {
              mimeType: imagePart.mimeType,
              data: imagePart.data
            }
          });
        }
        parts.push({ text: `SYSTEM:\n${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}` });

        const result = await client.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts }],
          config: { maxOutputTokens: 500, temperature: 0.7 }
        });

        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (text && text.length > 40) {
          console.log(`[PromptCraftingAgent] ✅ Agent 1 crafted prompt: "${text.slice(0, 100)}..."`);
          return {
            success: true,
            craftedPrompt: text,
            model: modelName
          };
        }
      } catch (err) {
        console.warn(`[PromptCraftingAgent] Model "${modelName}" note:`, err.message);
      }
    }
  }

  // Fallback prompt crafting if AI client is unavailable
  const fallbackPrompt = `Commercial advertising studio setup for ${cleanBrand} focusing on "${topic}", highlighting ${visualDirective || topic}, modern architectural interior, brand color harmony (${colorsText}), subtle ambient lighting, crisp product focus, 8k resolution, photorealistic, professional studio lighting, Hasselblad H6D-100c, masterwork, clean commercial photography, no rendered text, no fake logos`;
  return {
    success: true,
    craftedPrompt: fallbackPrompt,
    model: 'Smart Fallback Prompt Generator'
  };
}

module.exports = {
  craftCardImagePrompt
};
