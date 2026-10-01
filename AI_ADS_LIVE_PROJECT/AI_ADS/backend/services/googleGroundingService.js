const { aiClient, globalAiClient } = require('../config/vertex');

/**
 * googleGroundingService.js
 * Executes real-time Google Search Grounding queries using Google Cloud Vertex AI / Gemini SDK
 */

async function searchWithGoogleGrounding(prompt, model = 'gemini-3.5-flash') {
  const client = globalAiClient || aiClient;
  if (!client) {
    console.warn('[GoogleGrounding] Google Vertex/Gemini client is not initialized.');
    return null;
  }

  let requestedModel = 'gemini-3.5-flash';
  const candidateModels = ['gemini-3.5-flash'];

  for (const mName of candidateModels) {
    let maxRetries = 2;
    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        if (retry > 0) {
          console.log(`[GoogleGrounding] Retrying model "${mName}" (Attempt ${retry + 1}/${maxRetries + 1}) after rate limit pause...`);
          await new Promise(resolve => setTimeout(resolve, 1200 * retry));
        }

        const response = await client.models.generateContent({
          model: mName,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        const text = response.text || '';
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata || {};
        const webQueries = groundingMetadata.webSearchQueries || [];
        const groundingChunks = (groundingMetadata.groundingChunks || []).map(c => c.web || c);

        return {
          success: true,
          text,
          webQueries,
          groundingChunks,
          groundingMetadata,
          model: mName
        };
      } catch (err) {
        const errStr = err.message || String(err);
        const isRateLimit = errStr.includes('429') || errStr.includes('Resource exhausted');
        console.warn(`[GoogleGrounding] Model "${mName}" attempt note: ${errStr.slice(0, 120)}`);

        if (isRateLimit && retry < maxRetries) {
          continue;
        }
        break;
      }
    }
  }

  return null;
}

module.exports = {
  searchWithGoogleGrounding
};
