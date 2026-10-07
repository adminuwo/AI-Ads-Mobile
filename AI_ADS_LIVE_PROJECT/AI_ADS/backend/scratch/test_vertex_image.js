require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');

const projectId = process.env.GCP_PROJECT_ID || 'ai-mall-484810';

console.log('--- TESTING VERTEX AI WITH US-CENTRAL1 & REGIONAL CLIENT ---');

async function testUsCentral1() {
  const regionsToTest = ['us-central1', 'asia-south1', 'us-east4'];
  const modelsToTest = ['imagen-3.0-generate-002', 'imagen-3.0-fast-generate-001', 'gemini-2.5-flash'];

  for (const reg of regionsToTest) {
    console.log(`\n========================================`);
    console.log(`Testing Region: ${reg}`);
    console.log(`========================================`);

    const client = new GoogleGenAI({
      vertexAI: true,
      project: projectId,
      location: reg
    });

    for (const modelName of modelsToTest) {
      console.log(`\nTrying model "${modelName}" in region "${reg}"...`);

      // Test 1: generateImages
      try {
        const res = await client.models.generateImages({
          model: modelName,
          prompt: 'A sleek modern luxury watch on a marble table, 8k commercial photo',
          config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' }
        });
        const bytes = res?.generatedImages?.[0]?.image?.imageBytes;
        if (bytes) {
          console.log(`🎉 SUCCESS! generateImages returned ${bytes.length} base64 bytes in ${reg}!`);
          return;
        }
      } catch (e) {
        console.log(`❌ generateImages error (${modelName} @ ${reg}):`, e.message);
      }

      // Test 2: generateContent with IMAGE modality
      try {
        const res = await client.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: 'A sleek modern luxury watch on a marble table' }] }],
          config: { responseModalities: ['IMAGE'] }
        });
        const part = res?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (part?.data) {
          console.log(`🎉 SUCCESS! generateContent returned ${part.data.length} bytes in ${reg}!`);
          return;
        }
      } catch (e) {
        console.log(`❌ generateContent error (${modelName} @ ${reg}):`, e.message);
      }
    }
  }
}

testUsCentral1().then(() => console.log('\n--- FINISHED ---')).catch(console.error);
