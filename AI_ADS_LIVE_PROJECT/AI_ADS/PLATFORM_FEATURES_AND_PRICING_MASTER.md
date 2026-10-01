# 🏢 AI Ads™ Enterprise Platform: Master Feature, API & Pricing Architecture

This master document provides a comprehensive mapping of **all 15 platform modules**, **43+ features**, their underlying **backend API endpoints**, **AI model assignments**, **real-world unit costs**, **all-feature workload cost analysis**, and a **50% Profit Margin Subscription Model**.

---

## 1. AI Model Provider Rate Table

- **Primary Engine**: Google Cloud Vertex AI (`@google/genai` SDK in `asia-south1` & Global)
- **Secondary Failover**: OpenAI API (`openai` SDK)

| Model Name | Exact Model ID | Provider | Input Rate (Prompt) | Output Rate (Completion) | Image Gen Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` | Google Cloud Vertex AI | **$0.075** / 1M tokens ($0.000075 / 1k) | **$0.30** / 1M tokens ($0.00030 / 1k) | — |
| **Gemini 3.5 Pro** | `gemini-3.5-pro` | Google Cloud Vertex AI | **$1.25** / 1M tokens ($0.00125 / 1k) | **$5.00** / 1M tokens ($0.00500 / 1k) | — |
| **Gemini 3.1 Flash Image** | `gemini-3.1-flash-image` | Google Cloud Vertex AI | — | — | **$0.030** / image |
| **Imagen 3 (Standard)** | `imagen-3.0-generate-002` | Google Cloud Vertex AI | — | — | **$0.030** / image |
| **GPT-4o** *(Failover)* | `gpt-4o` | OpenAI API | **$2.50** / 1M tokens | **$10.00** / 1M tokens | — |

---

## 2. Complete Module & Feature API Mapping with Operating Costs

*Currency conversion rate: $1 USD ≈ ₹83.5 INR.*

| Module | Feature Name | Backend Route & Service | AI Model Used | Avg Input / Output Tokens | Cost in USD ($) | Cost in INR (₹) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Brand DNA** | Website Scraper & Scraping Modal | `POST /api/workspace/upload-doc`<br>`modules/workspace/brandScraper.service.js` | Cheerio / Puppeteer | N/A | **$0.00000** | **₹0.00** |
| | Multi-Agent Brand DNA Extraction | `POST /api/brand/analyze`<br>`modules/brandDnaAgent/` | `gemini-3.5-flash` | ~6,000 in / ~3,000 out | **$0.00135** | **~₹0.11** |
| | Brand Identity & Tone Editor | `PUT /api/brand/:workspaceId` | MongoDB / Memory | N/A | **$0.00000** | **₹0.00** |
| | Data Provenance & Confidence Audit | `modules/brandDnaAgent/brandValidatorAgent.js` | `gemini-3.5-flash` | ~2,000 in / ~1,000 out | **$0.00045** | **~₹0.04** |
| **2. Strategy Hub** | 30-Day Marketing Roadmap Generator | `POST /api/workspace/:id/generate-strategy` | `gemini-3.5-flash` | ~4,000 in / ~3,500 out | **$0.00135** | **~₹0.11** |
| | Single-Card Strategy Regenerator | `POST /api/workspace/:id/regenerate-strategy-card` | `gemini-3.5-flash` | ~1,000 in / ~300 out | **$0.00016** | **~₹0.014** |
| | Channel Mix & Funnel Allocations | Integrated in Strategy Generator | `gemini-3.5-flash` | Bundled in Strategy | — | — |
| | 1-Click Push to Content Calendar | `POST /api/calendar/entries` | Node API / DB | N/A | **$0.00000** | **₹0.00** |
| **3. SEO Intelligence**| Keyword Research & Intent Clusters | `POST /api/seo/keywords/cluster` | `gemini-3.5-flash` | ~3,000 in / ~2,000 out | **$0.00083** | **~₹0.07** |
| | Single Keyword Regenerator | `POST /api/seo/keywords/regenerate` | `gemini-3.5-flash` | ~800 in / ~200 out | **$0.00012** | **~₹0.01** |
| | AI SEO Content Brief Builder | `POST /api/seo/brief/generate` | `gemini-3.5-flash` | ~3,500 in / ~2,500 out | **$0.00101** | **~₹0.08** |
| **4. Content Studio**| Multi-Platform Social Copy Generator | `POST /api/content/social/generate` | `gemini-3.5-flash` | ~1,500 in / ~800 out | **$0.00035** | **~₹0.03** |
| | Long-Form SEO Blog Generator | `POST /api/content/blog/draft` | `gemini-3.5-flash` | ~2,500 in / ~3,000 out | **$0.00109** | **~₹0.09** |
| | Email Newsletter & Sales Copy | `POST /api/content/email/generate` | `gemini-3.5-flash` | ~1,800 in / ~1,200 out | **$0.00050** | **~₹0.04** |
| | Direct-Response Ad Copy Generator | `POST /api/content/ad-copy/generate` | `gemini-3.5-flash` | ~1,500 in / ~1,000 out | **$0.00041** | **~₹0.035** |
| | "+ Quick Post" Floating Modal | `POST /api/content/social/generate` | `gemini-3.5-flash` | ~1,200 in / ~600 out | **$0.00027** | **~₹0.022** |
| **5. Creative Studio**| AI Ad Image / Visual Generator | `POST /api/creative/visual/generate`<br>`services/brandImageAgent.service.js` | `gemini-3.1-flash-image`<br>`imagen-3.0-generate-002` | 1 Image | **$0.03000** | **~₹2.50** |
| | Visual Aspect Ratio & Style Control | Integrated in Brand Image Agent | `gemini-3.1-flash-image` | Bundled in Image | — | — |
| | Visual Variation Generator (4x) | `services/brandVisualResolver.js` | `gemini-3.1-flash-image` | 4 Images | **$0.12000** | **~₹10.00** |
| | Visual Credits & Topup System | `POST /api/creative/credits/topup` | Mongo / Credit API | N/A | **$0.00000** | **₹0.00** |
| **6. AI Web Builder**| Brief Clarification Analyzer | `modules/websiteBuilder/services/clarificationAnalyzer.service.js` | `gemini-3.5-flash` | ~1,200 in / ~400 out | **$0.00021** | **~₹0.017** |
| | Full Page HTML & Code Generation | `modules/websiteBuilder/websiteBuilder.service.js` | `gemini-3.5-flash` | ~5,500 in / ~4,500 out | **$0.00176** | **~₹0.15** |
| | Hero Banner Visuals (Optional 2x) | `services/brandImageAgent.service.js` | `gemini-3.1-flash-image` | 2 Images | **$0.06000** | **~₹5.00** |
| | Live AI Chat Edit per turn | `modules/websiteBuilder/services/chatEditInterpreter.service.js` | `gemini-3.5-flash` | ~2,500 in / ~1,200 out | **$0.00055** | **~₹0.046** |
| **7. Campaign Builder**| Multi-Channel Campaign Planner | `POST /api/campaigns/:id/generate-strategy` | `gemini-3.5-flash` | ~3,500 in / ~3,000 out | **$0.00116** | **~₹0.096** |
| | Campaign Post Generator | `POST /api/campaigns/posts/:postId/generate-content` | `gemini-3.5-flash` | ~1,500 in / ~800 out | **$0.00035** | **~₹0.03** |
| **8. Calendar** | Content Calendar & Drag-Drop View | `GET /api/calendar/entries` | Node / DB | N/A | **$0.00000** | **₹0.00** |
| **9. Approvals Desk**| Review Queue & Workflow | `PATCH /api/approvals/status` | Node / DB | N/A | **$0.00000** | **₹0.00** |
| **10. Asset Library**| Media Library & Signed URL Storage | `services/gcsStorageService.js` | Google Cloud Storage | Storage Bandwidth | **~$0.00001** | **~₹0.001** |
| **11. Analytics** | KPI Performance Dashboard | `GET /api/analytics/summary` | Node / DB | N/A | **$0.00000** | **₹0.00** |
| **12. Team RBAC** | Member Roles & Access Controls | Node Middleware / RBAC | N/A | N/A | **$0.00000** | **₹0.00** |
| **13. Workspaces**| Multi-Brand Workspace Switcher | `POST /api/workspace/create` | Node / DB | N/A | **$0.00000** | **₹0.00** |
| **14. AISA Copilot** | Floating Multi-turn AI Assistant | `POST /api/chat`<br>`controllers/chatController.js` | `gemini-3.5-flash` | ~1,500 in / ~500 out | **$0.00026** | **~₹0.02** |
| **15. Admin Console**| Super Admin Metrics & Telemetry | `GET /api/admin/*` | Node / DB | N/A | **$0.00000** | **₹0.00** |

---

## 3. 💡 Why Image Generation Dominates Total Cost vs Text Features

| Feature Category | Cost per Action (USD $) | Cost per Action (INR ₹) | Relative Cost Comparison |
| :--- | :--- | :--- | :--- |
| 🖼️ **1 AI Image Generation** | **$0.03000** | **₹2.500** | **1 Image = Cost of 17 AI Websites or 85 Blog Posts** |
| 🌐 **1 AI Website Landing Page** | **$0.00176** | **₹0.150** | 17 Websites = Cost of 1 Image |
| 📝 **1 Long Blog Post (1.5k words)**| **$0.00109** | **₹0.090** | 27 Blogs = Cost of 1 Image |
| 📈 **1 SEO Keyword Brief** | **$0.00083** | **₹0.070** | 36 SEO Briefs = Cost of 1 Image |
| ✏️ **1 Single Card Regeneration** | **$0.00016** | **₹0.014** | 187 Card Regenerations = Cost of 1 Image |

---

## 4. 📊 All-Feature Workload Consumption Model Per Subscription Tier

Below is the **complete feature-by-feature consumption breakdown** showing how EVERY feature (SEO, AI Web Building, Strategy, Copywriting, Copilot Chat, AND Image Generation) is budgeted in each tier for a **50% Net Profit Margin**.

### A. Starter Plan ($9.99 / mo / ₹799 / mo)
- **User Pays Us**: **$9.99 / mo (₹799 / mo)**
- **Net Company Profit**: **$4.99 / mo (₹382 INR / 50.0% Margin)**
- **Our Total Spend Limit**: **$5.00 / mo (₹417 INR)**

| Included Feature Workload | Monthly Quantity | Model Used | API Spend ($) | API Spend (₹) | % of Spend |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🖼️ **AI Ad Images & Banners** | **140 Images** | `gemini-3.1-flash-image` | **$4.200** | **₹350.70** | **84.0%** |
| 🌐 **AI Website Builder Pages** | **15 Full Websites** | `gemini-3.5-flash` | **$0.026** | **₹2.17** | **0.5%** |
| 💬 **AI Web Builder Live Edits** | **50 Live Edits** | `gemini-3.5-flash` | **$0.027** | **₹2.25** | **0.5%** |
| 📈 **SEO Keyword Clusters & Briefs** | **30 SEO Briefs** | `gemini-3.5-flash` | **$0.025** | **₹2.09** | **0.5%** |
| 🗺️ **30-Day Strategy Roadmaps** | **10 Full Roadmaps** | `gemini-3.5-flash` | **$0.013** | **₹1.08** | **0.3%** |
| ✏️ **Single Card Regenerations** | **100 Card Regenerations** | `gemini-3.5-flash` | **$0.016** | **₹1.34** | **0.3%** |
| 📝 **Content Studio (Copy & Blogs)**| **200 Social Posts & Blogs**| `gemini-3.5-flash` | **$0.140** | **₹11.69** | **2.8%** |
| 🤖 **AISA Copilot Messages** | **500 Messages** | `gemini-3.5-flash` | **$0.130** | **₹10.85** | **2.6%** |
| ☁️ **GCS Storage & Cloud Infra** | **Media Storage** | Google Cloud Storage | **$0.423** | **₹35.33** | **8.5%** |
| 💰 **OUR TOTAL COMPANY SPEND** | **ALL FEATURES INCLUDED** | — | **$5.000 / mo** | **₹417.50** | **100.0%** |

---

### B. Pro / Growth Plan ($29.99 / mo / ₹2,399 / mo)
- **User Pays Us**: **$29.99 / mo (₹2,399 / mo)**
- **Net Company Profit**: **$14.99 / mo (₹1,147 INR / 50.0% Margin)**
- **Our Total Spend Limit**: **$15.00 / mo (₹1,252 INR)**

| Included Feature Workload | Monthly Quantity | Model Used | API Spend ($) | API Spend (₹) | % of Spend |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🖼️ **AI Ad Images & Banners** | **420 Images** | `gemini-3.1-flash-image` | **$12.600** | **₹1,052.10** | **84.0%** |
| 🌐 **AI Website Builder Pages** | **50 Full Websites** | `gemini-3.5-flash` | **$0.088** | **₹7.35** | **0.6%** |
| 💬 **AI Web Builder Live Edits** | **200 Live Edits** | `gemini-3.5-flash` | **$0.110** | **₹9.18** | **0.7%** |
| 📈 **SEO Keyword Clusters & Briefs** | **100 SEO Briefs** | `gemini-3.5-flash` | **$0.083** | **₹6.93** | **0.6%** |
| 🗺️ **30-Day Strategy Roadmaps** | **30 Full Roadmaps** | `gemini-3.5-flash` | **$0.040** | **₹3.34** | **0.3%** |
| ✏️ **Single Card Regenerations** | **300 Card Regenerations** | `gemini-3.5-flash` | **$0.049** | **₹4.09** | **0.3%** |
| 📝 **Content Studio (Copy & Blogs)**| **800 Social Posts & Blogs**| `gemini-3.5-flash` | **$0.560** | **₹46.76** | **3.7%** |
| 🤖 **AISA Copilot Messages** | **1,500 Messages** | `gemini-3.5-flash` | **$0.390** | **₹32.56** | **2.6%** |
| ☁️ **GCS Storage & Cloud Infra** | **Media Storage** | Google Cloud Storage | **$1.080** | **₹90.18** | **7.2%** |
| 💰 **OUR TOTAL COMPANY SPEND** | **ALL FEATURES INCLUDED** | — | **$15.000 / mo** | **₹1,252.50** | **100.0%** |

---

### C. Agency / Scale Plan ($79.99 / mo / ₹6,399 / mo)
- **User Pays Us**: **$79.99 / mo (₹6,399 / mo)**
- **Net Company Profit**: **$39.99 / mo (₹3,059 INR / 50.0% Margin)**
- **Our Total Spend Limit**: **$40.00 / mo (₹3,340 INR)**

| Included Feature Workload | Monthly Quantity | Model Used | API Spend ($) | API Spend (₹) | % of Spend |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🖼️ **AI Ad Images & Banners** | **1,150 Images** | `gemini-3.1-flash-image` | **$34.500** | **₹2,880.75** | **86.3%** |
| 🌐 **AI Website Builder Pages** | **150 Full Websites** | `gemini-3.5-flash` | **$0.264** | **₹22.04** | **0.7%** |
| 💬 **AI Web Builder Live Edits** | **500 Live Edits** | `gemini-3.5-flash` | **$0.275** | **₹22.96** | **0.7%** |
| 📈 **SEO Keyword Clusters & Briefs** | **300 SEO Briefs** | `gemini-3.5-flash` | **$0.249** | **₹20.79** | **0.6%** |
| 🗺️ **30-Day Strategy Roadmaps** | **100 Full Roadmaps** | `gemini-3.5-flash` | **$0.135** | **₹11.27** | **0.3%** |
| ✏️ **Single Card Regenerations** | **1,000 Card Regenerations**| `gemini-3.5-flash` | **$0.165** | **₹13.78** | **0.4%** |
| 📝 **Content Studio (Copy & Blogs)**| **2,500 Social Posts & Blogs**| `gemini-3.5-flash` | **$1.750** | **₹146.12** | **4.4%** |
| 🤖 **AISA Copilot Messages** | **5,000 Messages** | `gemini-3.5-flash` | **$1.300** | **₹108.55** | **3.3%** |
| ☁️ **GCS Storage & Cloud Infra** | **Media Storage** | Google Cloud Storage | **$1.362** | **₹113.74** | **3.4%** |
| 💰 **OUR TOTAL COMPANY SPEND** | **ALL FEATURES INCLUDED** | — | **$40.000 / mo** | **₹3,340.00** | **100.0%** |

---

## 5. Credit Top-Up Packs (50% Profit Margin)

| Top-Up Pack Name | User Selling Price | Granted Image Credits | 💰 OUR TOTAL SPEND (API @ $0.03/img) | 📈 OUR NET PROFIT | Profit Margin |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mini Top-Up Pack** | **$6.00** (₹499) | **100 Image Credits** | **$3.00** (₹250) | **$3.00** (₹249) | **50.0%** |
| **Standard Top-Up Pack** | **$15.00** (₹1,199) | **250 Image Credits** | **$7.50** (₹626) | **$7.50** (₹573) | **50.0%** |
| **Mega Top-Up Pack** | **$50.00** (₹3,999) | **850 Image Credits** | **$25.00** (₹2,087) | **$25.00** (₹1,912) | **50.0%** |

---

## 6. GCP Quota & Infrastructure Checklist

1. **Vertex AI API**: Enabled in GCP Console.
2. **Quota Limits**:
   - `gemini-3.5-flash`: **300+ RPM** (Requests Per Minute).
   - `gemini-3.1-flash-image`: **50+ RPM** image generation quota.
3. **Storage & IAM**: Google Cloud Storage bucket `ai-ads-creatives` with ADC credentials (`GOOGLE_APPLICATION_CREDENTIALS`).

---
*Maintained for AI Ads™ Enterprise Platform Production Deployment.*
