# 🚀 Production AI Model Architecture & Cost Plan Guide

This document outlines all AI models utilized in the production version of the **AI Ads™ Enterprise Platform**, official Google Cloud Vertex AI & OpenAI rates, per-feature costs, AI Website Builder breakdown, and subscription plans engineered for a **strict 50% Profit Margin**.

---

## 1. Production Model Architecture

- **SDKs**: `@google/genai` (Vertex AI Mode) & `openai`
- **Authentication**: Application Default Credentials (ADC) & `OPENAI_API_KEY`
- **Primary Region**: `asia-south1` (Text/Multimodal) & Global (Visuals)

| Model Name | Model ID | Primary App Features | Type |
| :--- | :--- | :--- | :--- |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` | • Strategy Hub (30-Day Plan & Card Regen)<br>• Content Studio (Copy, Blogs, Ads, Emails)<br>• Brand DNA (Scraping Analysis & Memory)<br>• AI Website Builder (Blueprints & Chat Edits)<br>• SEO Intelligence (Clusters & Briefs)<br>• AISA Copilot Chat (Multi-turn & Multimodal) | Text & Multimodal |
| **Gemini 3.5 Pro** | `gemini-3.5-pro` | • AI Website Builder (Complex Multi-page Blueprints) | Deep Text Reasoning |
| **Gemini 3.1 Flash Image** | `gemini-3.1-flash-image` | • Creative Studio & Brand Visuals (Ad Banners & Visuals) | Image Generation |
| **Imagen 3** | `imagen-3.0-generate-002` | • Creative Studio (Fallback Commercial Visuals) | High-Fidelity Image |
| **GPT-4o** | `gpt-4o` | • Failover Text Engine (Secondary Fallback) | Failover Text |

---

## 2. Official Provider Unit Rate Pricing

### A. Google Cloud Vertex AI Pricing (Pay-As-You-Go)

| Model | Input Tokens / Prompt | Output Tokens / Completion | Image Generation |
| :--- | :--- | :--- | :--- |
| **Gemini 3.5 Flash** | **$0.075** per 1M tokens ($0.000075 / 1k) | **$0.30** per 1M tokens ($0.00030 / 1k) | — |
| **Gemini 3.5 Pro** | **$1.25** per 1M tokens ($0.00125 / 1k) | **$5.00** per 1M tokens ($0.00500 / 1k) | — |
| **Gemini 3.1 Flash Image** | — | — | **$0.030** per image ($0.030/img) |
| **Imagen 3 (Standard)** | — | — | **$0.030** per image ($0.030/img) |

---

## 3. Real-World Per-Feature Cost Breakdown

*Values calculated using average token usage per feature on Gemini 3.5 Flash & Gemini 3.1 Flash Image ($1 USD ≈ ₹83.5 INR).*

| Feature / User Action | Model Used | Avg Input | Avg Output | Cost in USD ($) | Cost in INR (₹) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Generate 30-Day Strategy Roadmap** | `gemini-3.5-flash` | ~4,000 tokens | ~3,500 tokens | **$0.00135** | **~₹0.11** |
| **2. Regenerate 1 Strategy Card** | `gemini-3.5-flash` | ~1,000 tokens | ~300 tokens | **$0.000165** | **~₹0.014** |
| **3. Generate 1 Social Post Copy / Hook** | `gemini-3.5-flash` | ~1,500 tokens | ~800 tokens | **$0.00035** | **~₹0.03** |
| **4. Generate 1 AI Brand Image / Ad Visual** | `gemini-3.1-flash-image` | N/A | 1 Image | **$0.03000** | **~₹2.50** |
| **5. Generate 1 Long-Form Blog Post (1.5k words)** | `gemini-3.5-flash` | ~2,500 tokens | ~3,000 tokens | **$0.00109** | **~₹0.09** |
| **6. Generate 1 AI Website Landing Page (Code & Content)** | `gemini-3.5-flash` | ~5,500 tokens | ~4,500 tokens | **$0.00176** | **~₹0.15** |
| **7. Generate 1 SEO Keyword Cluster & Brief** | `gemini-3.5-flash` | ~3,000 tokens | ~2,000 tokens | **$0.00083** | **~₹0.07** |

---

## 4. 🌐 Detailed AI Website Builder Cost Analysis

The **AI Website Builder Module** uses a 3-step pipeline:

```
[User Prompt & Brand DNA] 
       ↓
(1) Brief Clarification Analyzer (gemini-3.5-flash)
       ↓
(2) Full Page HTML/CSS Blueprint Generation (gemini-3.5-flash)
       ↓
(3) Hero Banner Image Generation (gemini-3.1-flash-image - Optional)
```

### Cost Step-by-Step Breakdown:

| Website Builder Step | Model Used | Tokens / Operation | Cost in USD ($) | Cost in INR (₹) |
| :--- | :--- | :--- | :--- | :--- |
| **Step 1: Brief Analysis** | `gemini-3.5-flash` | ~1.2k in / ~400 out | **$0.00021** | **~₹0.017** (1.7 Paisa) |
| **Step 2: Full Page HTML & Design Code** | `gemini-3.5-flash` | ~5.5k in / ~4.5k out | **$0.00176** | **~₹0.150** (15 Paisa) |
| **Step 3: AI Hero Banner Image** (Optional) | `gemini-3.1-flash-image` | 1 Image | **$0.03000** | **~₹2.500** (₹2.50) |
| **Step 4: AI Live Chat Edit** (Per edit turn) | `gemini-3.5-flash` | ~2.5k in / ~1.2k out | **$0.00055** | **~₹0.046** (4.6 Paisa) |

### 💡 AI Website Builder Cost Totals:

- 🟢 **Full Website Generation (Code & Text Copy Only)**: **$0.00197 USD** (~**₹0.16 INR** / **16 Paisa** per website)
- 🎨 **Full Website Generation (Code, Text + 2 Hero Banner Images)**: **$0.06197 USD** (~**₹5.16 INR** per website)
- 💬 **Live Chat Modifications / Tweak per Turn**: **$0.00055 USD** (~**₹0.046 INR** / **4.6 Paisa** per edit)

---

## 5. 📊 50% Profit Margin Subscription Plan Architecture

To achieve a **strict 50% Net Profit Margin**, 50% of the subscription price covers API & Cloud Infrastructure costs, and the remaining 50% is pure company profit.

> **Formula**: `Subscription Price = 2 × (Included API & Cloud Cost)`

### A. Monthly Subscription Plans (50% Profit Margin)

| Plan Tier | Monthly Price (USD) | Monthly Price (INR) | API Cost Allowance (50%) | Included Image Credits | Included Text Generations | Net Company Profit |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Starter** | **$9.99 / mo** | **₹799 / mo** | $5.00 (₹400) | **150 Images** | **1,000 Generations** | **$4.99 / mo (50%)** |
| **Pro / Growth** | **$29.99 / mo** | **₹2,399 / mo** | $15.00 (₹1,200) | **450 Images** | **3,000 Generations** | **$14.99 / mo (50%)** |
| **Agency / Scale** | **$79.99 / mo** | **₹6,399 / mo** | $40.00 (₹3,200) | **1,200 Images** | **8,000 Generations** | **$39.99 / mo (50%)** |
| **Enterprise** | **$199.99 / mo** | **₹15,999 / mo** | $100.00 (₹8,000) | **3,000 Images** | **Unlimited Text** | **$99.99 / mo (50%)** |

---

### B. Credit Top-Up Packs (50% Profit Margin)

For users who run out of monthly credits:

| Top-Up Pack | Selling Price (USD) | Selling Price (INR) | API Cost (50%) | Granted Image Credits | User Price / Image | Net Profit (50%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mini Pack** | **$6.00** | **₹499** | $3.00 (₹250) | **100 Images** | $0.06 (₹5.00) | **$3.00 (50%)** |
| **Standard Pack** | **$15.00** | **₹1,199** | $7.50 (₹600) | **250 Images** | $0.06 (₹4.80) | **$7.50 (50%)** |
| **Mega Pack** | **$50.00** | **₹3,999** | $25.00 (₹2,000) | **850 Images** | $0.058 (₹4.70) | **$25.00 (50%)** |

---

## 6. GCP Quota & Setup Checklist

1. **GCP Console**: Enable Vertex AI API & Google Cloud Storage API.
2. **Quotas**:
   - `gemini-3.5-flash`: Set RPM quota to **300+ RPM**.
   - `gemini-3.1-flash-image`: Ensure **50+ RPM** image generation quota.
3. **Credentials**: Configure ADC file via `GOOGLE_APPLICATION_CREDENTIALS` or GCP Service Account.

---
*Maintained for AI Ads™ Enterprise Platform Deployment.*
