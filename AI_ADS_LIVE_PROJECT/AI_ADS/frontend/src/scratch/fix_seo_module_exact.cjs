const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../features/seo/SeoModule.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ['SEO Keyword Intelligence & Competitor Gap Engine', '{t("SEO Keyword Intelligence & Competitor Gap Engine", "SEO Keyword Intelligence & Competitor Gap Engine")}'],
  ['Real-time verified on-page scraping, Google SERP rankings, and dynamic competitor keyword gap analysis.', '{t("Real-time verified on-page scraping, Google SERP rankings, and dynamic competitor keyword gap analysis.", "Real-time verified on-page scraping, Google SERP rankings, and dynamic competitor keyword gap analysis.")}'],
  ['VERIFIED ON-PAGE', '{t("VERIFIED ON-PAGE", "VERIFIED ON-PAGE")}'],
  ['SEARCH RANKINGS', '{t("SEARCH RANKINGS", "SEARCH RANKINGS")}'],
  ['COMPETITOR GAP', '{t("COMPETITOR GAP", "COMPETITOR GAP")}'],
  ['AI OPPORTUNITY', '{t("AI OPPORTUNITY", "AI OPPORTUNITY")}'],
  ['Target Website URL', '{t("Target Website URL", "Target Website URL")}'],
  ['Target Focus Topic', '{t("Target Focus Topic", "Target Focus Topic")}'],
  ['Search Intent', '{t("Search Intent", "Search Intent")}'],
  ['<option value="Commercial">Commercial (Compare)</option>', '<option value="Commercial">{t("Commercial (Compare)", "Commercial (Compare)")}</option>'],
  ['<option value="Transactional">Transactional (Buy / Convert)</option>', '<option value="Transactional">{t("Transactional (Buy / Convert)", "Transactional (Buy / Convert)")}</option>'],
  ['<option value="Informational">Informational (Learn)</option>', '<option value="Informational">{t("Informational (Learn)", "Informational (Learn)")}</option>'],
  ['<option value="Navigational">Navigational (Find)</option>', '<option value="Navigational">{t("Navigational (Find)", "Navigational (Find)")}</option>'],
  ["<span>{isAuditing ? '...' : 'Audit'}</span>", "<span>{isAuditing ? '...' : t('Audit', 'Audit')}</span>"],
  ['Overview Matrix ({totalAnalyzedKeywords})', '{t("Overview Matrix", "Overview Matrix")} ({totalAnalyzedKeywords})'],
  ['1. On-Page Terms & Collections ({onSiteKeywords.length})', '{t("1. On-Page Terms & Collections", "1. On-Page Terms & Collections")} ({onSiteKeywords.length})'],
  ['3. Competitor Gaps ({competitorGaps.length})', '{t("3. Competitor Gaps", "3. Competitor Gaps")} ({competitorGaps.length})'],
  ['4. AI Opportunities ({opportunityKeywords.length})', '{t("4. AI Opportunities", "4. AI Opportunities")} ({opportunityKeywords.length})'],
  ['Topic Clusters ({keywordClusters.length})', '{t("Topic Clusters", "Topic Clusters")} ({keywordClusters.length})'],
  ['Autonomous SEO Agents Crawling...', '{t("Autonomous SEO Agents Crawling...", "Autonomous SEO Agents Crawling...")}'],
  ['Enter Website URL to Launch Intelligence Audit', '{t("Enter Website URL to Launch Intelligence Audit", "Enter Website URL to Launch Intelligence Audit")}'],
  ['Run Verified SEO Analysis', '{t("Run Verified SEO Analysis", "Run Verified SEO Analysis")}'],
  ['⚡ Quick Wins (AI-Suggested Ranking Opportunities)', '⚡ {t("Quick Wins (AI-Suggested Ranking Opportunities)", "Quick Wins (AI-Suggested Ranking Opportunities)")}'],
  ['{quickWins.length} AI-Suggested Wins Available', '{quickWins.length} {t("AI-Suggested Wins Available", "AI-Suggested Wins Available")}'],
  ['On-Page Terms &\n                        Collections', '{t("On-Page Terms & Collections", "On-Page Terms & Collections")}'],
  ['On-Page Terms &\n                      Collections', '{t("On-Page Terms & Collections", "On-Page Terms & Collections")}'],
  ['Verified from live HTML tags, body & collection links', '{t("Verified from live HTML tags, body & collection links", "Verified from live HTML tags, body & collection links")}'],
  ['Current Search Rankings', '{t("Current Search Rankings", "Current Search Rankings")}'],
  ['Search engine keyword positions', '{t("Search engine keyword positions", "Search engine keyword positions")}'],
  ['Competitor Keyword Gaps', '{t("Competitor Keyword Gaps", "Competitor Keyword Gaps")}'],
  ['Where competitors outrank target domain', '{t("Where competitors outrank target domain", "Where competitors outrank target domain")}'],
  ['AI-suggested competitor opportunities', '{t("AI-suggested competitor opportunities", "AI-suggested competitor opportunities")}'],
  ['<span>AI-Suggested Opportunities & Recommended Actions</span>', '<span>{t("AI-Suggested Opportunities & Recommended Actions", "AI-Suggested Opportunities & Recommended Actions")}</span>'],
  ['Recommendations synthesized from website content, ranking data & competitor gaps', '{t("Recommendations synthesized from website content, ranking data & competitor gaps", "Recommendations synthesized from website content, ranking data & competitor gaps")}'],
  ['Market Competitor Intelligence', '{t("Market Competitor Intelligence", "Market Competitor Intelligence")}'],
  ['Overview of Direct Competitors & Category Rivals', '{t("Overview of Direct Competitors & Category Rivals", "Overview of Direct Competitors & Category Rivals")}'],
  ['<span>AI-Suggested Topic Clusters & Strategic Content Mapping</span>', '<span>{t("AI-Suggested Topic Clusters & Strategic Content Mapping", "AI-Suggested Topic Clusters & Strategic Content Mapping")}</span>'],
  ['Technical Strategy & Google Rich Schema Blueprint', '{t("Technical Strategy & Google Rich Schema Blueprint", "Technical Strategy & Google Rich Schema Blueprint")}'],
  ['<span>Copy Schema.org JSON-LD</span>', '<span>{t("Copy Schema.org JSON-LD", "Copy Schema.org JSON-LD")}</span>'],
  ['Suggested High-CTR Title Tags', '{t("Suggested High-CTR Title Tags", "Suggested High-CTR Title Tags")}'],
  ['Meta Description (155 Chars)', '{t("Meta Description (155 Chars)", "Meta Description (155 Chars)")}'],
  ['Internal Linking Blueprint', '{t("Internal Linking Blueprint", "Internal Linking Blueprint")}'],
  ['<span>Proceed to Campaign</span>', '<span>{t("Proceed to Campaign", "Proceed to Campaign")}</span>'],
  ['<span>Generate AI Strategy</span>', '<span>{t("Generate AI Strategy", "Generate AI Strategy")}</span>']
];

for (const [target, replacement] of replacements) {
  content = content.replaceAll(target, replacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SeoModule.jsx updated with all t(...) wrappers!');
