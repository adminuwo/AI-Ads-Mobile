const { generateWebsiteVisualAssetsSequential } = require('../backend/modules/websiteBuilder/services/visualAssetEngine.service');

async function test() {
  console.log('Testing generateWebsiteVisualAssetsSequential with Indian God Portraits requirement...');
  
  const requirement = {
    businessType: 'Devotional Art & Deity Portrait Store',
    industry: 'Art, Home Decor & Spiritual Goods',
    brandName: 'DevaArt Gallery',
    prompt: 'Create a website for indian god portraits...',
    proposedPages: [
      {
        name: 'Sacred Gallery',
        slug: 'sacred-gallery',
        recommendedSections: [
          {
            type: 'HeroBanner',
            title: 'DevaArt Gallery Eternal Presence in Your Home Hero'
          },
          {
            type: 'HeroBanner',
            title: 'DevaArt Gallery Crafted for Generations Hero'
          },
          {
            type: 'ContentSectionCard',
            title: 'Divine Canvas The Artistry Behind the Devotion Hero'
          }
        ]
      }
    ]
  };

  const result = await generateWebsiteVisualAssetsSequential(requirement, 'test_req_123');
  console.log('\nResult Total Assets:', result.totalAssets);
  console.log('Result Unique URLs:', result.uniqueUrls);
  console.log('Manifest:', result.assetManifest.map(a => ({ subject: a.requestedSubject, url: a.imageUrl })));
}

test().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
