# AI ADS™ — Platform Architecture & Feature Documentation

> **Version**: 3.5.0 Enterprise  
> **Platform Name**: AI ADS™ (Autonomous Content Intelligence & 8K Creative Studio)  
> **Target Audience**: Enterprise Marketing Teams, Digital Growth Agencies, Content Creators, Brand Managers  

---

## Executive Summary

**AI ADS™** is an all-in-one, enterprise-grade governed artificial intelligence content creation and multi-channel publishing platform. By combining multi-tenant **Brand DNA memory**, an autonomous **2-Agent Vision Architecture**, **30-Day Campaign Strategy Generation**, photorealistic **8K visual ad rendering**, and an **AI Landing Page Generator**, AI ADS™ enables marketing teams to scale content velocity up to **10x faster** while eliminating brand voice drift.

---

## Table of Contents

1. [Platform Architecture Overview](#1-platform-architecture-overview)
2. [Core Platform Modules & Features](#2-core-platform-modules--features)
   - [2.1 Brand DNA Memory & Automated Scraper](#21-brand-dna-memory--automated-scraper)
   - [2.2 30-Day Strategy Roadmap Engine](#22-30-day-strategy-roadmap-engine)
   - [2.3 Creative Studio & 2-Agent Vision Pipeline](#23-creative-studio--2-agent-vision-pipeline)
   - [2.4 Content Studio & Carousel Builder](#24-content-studio--carousel-builder)
   - [2.5 AI Website & Landing Page Builder](#25-ai-website--landing-page-builder)
   - [2.6 SEO Intelligence & JSON-LD Briefs](#26-seo-intelligence--json-ld-briefs)
   - [2.7 Omnichannel Publishing Calendar](#27-omnichannel-publishing-calendar)
   - [2.8 Approvals Desk & Human-in-the-Loop Governance](#28-approvals-desk--human-in-the-loop-governance)
   - [2.9 Embedded AISA™ AI Copilot Assistant](#29-embedded-aisa-ai-copilot-assistant)
   - [2.10 Analytics & Velocity Hub](#210-analytics--velocity-hub)
   - [2.11 Team RBAC & Workspace Isolation](#211-team-rbac--workspace-isolation)
   - [2.12 Settings, Billing & Transparent INR Pricing](#212-settings-billing--transparent-inr-pricing)
3. [The 2-Agent Autonomous Vision Architecture](#3-the-2-agent-autonomous-vision-architecture)
4. [User Roles & RBAC Governance](#4-user-roles--rbac-governance)
5. [Technical Architecture & Stack](#5-technical-architecture--stack)
6. [Pricing & Credit Model (INR ₹)](#6-pricing--credit-model-inr-)
7. [API & Integration Specifications](#7-api--integration-specifications)

---

## 1. Platform Architecture Overview

AI ADS™ is built as a modular microservices architecture connecting React (Vite + Tailwind CSS), Node.js (Express), MongoDB, and Google Cloud Platform (Gemini 3.1 Flash Image, Imagen 3, Vertex AI, GCS V4 Signed Bucket Storage).

```
                      ┌─────────────────────────────────────────┐
                      │          AI ADS™ Web Platform           │
                      │ (React 18 + Vite + Tailwind CSS + Context)│
                      └────────────────────┬────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │      Node.js REST API Gateway       │
                        │    (Express + RBAC + Credit Engine) │
                        └──────────────────┬──────────────────┘
                                           │
    ┌──────────────────────┬───────────────┴───────────────┬──────────────────────┐
    │                      │                               │                      │
┌───┴──────────┐   ┌───────┴──────────┐         ┌──────────┴────────┐    ┌────────┴─────────┐
│ MongoDB      │   │ Google Gemini    │         │ Vertex AI        │    │ Google Cloud     │
│ Database     │   │ Vision 3.1 Flash │         │ Imagen 3 / Flux  │    │ Storage (GCS)    │
│ (Brand DNA)  │   │ (Strategy & Prompt)        │ (8K Ad Visuals)  │    │ (Signed V4 URLs) │
└──────────────┘   └──────────────────┘         └──────────────────┘    └──────────────────┘
```

---

## 2. Core Platform Modules & Features

### 2.1 Brand DNA Memory & Automated Scraper
* **Route**: `/brand-dna`
* **Purpose**: Ingests company website URLs to extract and anchor brand identity into single-source AI memory.
* **Key Features**:
  * **Automated URL Scraper**: Extracts logo image assets, primary/secondary hex color palettes, typography specs, positioning statements, core values, and verified claims.
  * **Immutable Brand Memory**: Locks brand guidelines into workspace state to ensure 100% brand voice alignment across all AI generations.
  * **Multi-Brand Switcher**: Easily switch between multiple client brand workspaces with isolated memories.

---

### 2.2 30-Day Strategy Roadmap Engine
* **Route**: `/strategy`
* **Purpose**: Generates complete 30-day non-repeating campaign execution plans tailored to brand DNA and reference products.
* **Key Features**:
  * **Multi-Channel Distribution**: Directives categorized across Instagram, LinkedIn, X (Twitter), and Facebook.
  * **Reference Photo Brief Analysis**: Upload product reference photos; Gemini Vision AI extracts lighting, product form factor, and photoshoot directives.
  * **1-Click Generation**: Converts campaign post directives straight into Creative Studio image briefs and Content Studio captions.

---

### 2.3 Creative Studio & 2-Agent Vision Pipeline
* **Route**: `/creative-studio`
* **Purpose**: Renders photorealistic 8K commercial ad visuals and marketing imagery.
* **Key Features**:
  * **2-Agent Autonomous Pipeline**: Automated prompt crafting and studio image rendering.
  * **Gemini 3.1 Flash Image Engine**: Generates high-fidelity commercial renders with studio lighting and realistic shadows.
  * **Automatic Logo Overlay**: Automatically watermarks rendered images with verified Brand DNA logos.
  * **GCS Export**: Instant V4 signed URL download and asset library integration.

---

### 2.4 Content Studio & Carousel Builder
* **Route**: `/content-studio`
* **Purpose**: AI copywriter and post designer for multi-channel social media and editorial content.
* **Key Features**:
  * **Instagram Carousel Builder**: Formats multi-slide carousels with slide-by-slide copy and visual prompts.
  * **LinkedIn Slide Decks & Viral X Threads**: Converts long-form ideas into high-converting slide decks and tweet threads.
  * **Tone & Style Customization**: Adjust formality, enthusiasm, emoji density, and CTA style.

---

### 2.5 AI Website & Landing Page Builder
* **Route**: `/website-builder`
* **Purpose**: Prompt-driven landing page generator with real-time code execution and visual preview.
* **Key Features**:
  * **Prompt to Full Landing Page**: Generate responsive landing pages with hero sections, feature grids, testimonials, pricing tables, and call-to-action blocks.
  * **Live Split Preview**: Toggle between live rendered browser view and responsive HTML/CSS code editor.
  * **Export Package**: 1-click download of full production HTML/CSS source packages and ZIP bundles.

---

### 2.6 SEO Intelligence & JSON-LD Briefs
* **Route**: `/seo-intelligence`
* **Purpose**: Search engine optimization, SERP keyword analysis, and structured schema markup.
* **Key Features**:
  * **Search Intent Analysis**: Identifies high-volume commercial, informational, and transactional keywords.
  * **JSON-LD Schema Generator**: Creates valid Schema.org JSON-LD code blocks (Article, Product, Organization, FAQPage).
  * **Content Brief Outlines**: Generates comprehensive SEO briefs for copywriters with target H1, H2, and H3 structures.

---

### 2.7 Omnichannel Publishing Calendar
* **Route**: `/calendar`
* **Purpose**: Interactive schedule grid for visual post management and auto-publishing.
* **Key Features**:
  * **Drag-and-Drop Calendar**: Easily reorder and reschedule campaign posts across days and weeks.
  * **Channel Filter**: Toggle views for Instagram, LinkedIn, X (Twitter), Facebook, and Blog posts.
  * **Social Preview Modal**: Preview how posts look on mobile and desktop feed layouts before publishing.

---

### 2.8 Approvals Desk & Human-in-the-Loop Governance
* **Route**: `/approvals-desk`
* **Purpose**: Quality assurance and brand safety workflow gate before posts go live.
* **Key Features**:
  * **Governance Queue**: Review pending AI-generated posts, copy captions, and visual assets.
  * **Brand Claim Verification**: Automated AI check flagging unverified claims against Brand DNA memory.
  * **1-Click Approve / Request Revision**: Reviewers and clients can approve content or request specific revisions.

---

### 2.9 Embedded AISA™ AI Copilot Assistant
* **Route**: Floating Drawer across platform
* **Purpose**: 24/7 intelligent platform assistant for instant advice and navigation.
* **Key Features**:
  * **Workflow Guidance**: Asks questions, refines image prompts, suggests campaign hooks, and answers platform queries.
  * **Instant Navigation**: Jump to any module (Brand DNA, Strategy, Creative Studio, Website Builder) via conversational commands.

---

### 2.10 Analytics & Velocity Hub
* **Route**: `/analytics`
* **Purpose**: Centralized dashboard for performance metrics and production velocity tracking.
* **Key Features**:
  * **Content Velocity Benchmark**: Track hours saved and post output speed (400% average velocity gain).
  * **Credit Consumption Metrics**: Real-time breakdown of visual credit usage per workspace.

---

### 2.11 Team RBAC & Workspace Isolation
* **Route**: `/team-rbac`
* **Purpose**: Enterprise role-based access control and client collaboration.
* **Key Features**:
  * **4 Granular Roles**: Super Admin, Agency Admin, Content Creator/Editor, Client Viewer.
  * **Multi-Tenant Isolation**: Complete data segregation between brand client accounts.

---

### 2.12 Settings, Billing & Transparent INR Pricing
* **Route**: `/settings-billing`
* **Purpose**: Workspace configuration, API key management, and subscription billing.
* **Key Features**:
  * **Transparent INR Pricing**: Flat rate billing in Indian Rupees (₹) starting at ₹799/month.
  * **Credit Rollover**: Unused visual AI credits roll over automatically to the next billing cycle.

---

## 3. The 2-Agent Autonomous Vision Architecture

AI ADS™ employs a proprietary 2-Agent pipeline for commercial ad photography:

```
┌────────────────────────────────┐
│ Reference Product Photo Upload │
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────┐
│  AGENT 1: Prompt Crafting Agent (Gemini Vision AI)     │
│  - Analyzes lighting, product contours & positioning   │
│  - Synthesizes studio environment & camera directives  │
└───────────────┬────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────┐
│  AGENT 2: Image Generation Agent (Vertex AI / Imagen)  │
│  - Renders photorealistic 8K commercial ad visual      │
│  - Applies automated Brand DNA logo watermarking       │
│  - Exports V4 signed URL asset to GCS Bucket           │
└────────────────────────────────────────────────────────┘
```

---

## 4. User Roles & RBAC Governance

| Role Name | Access Level | Description |
| :--- | :--- | :--- |
| **Super Admin** | Full System Control | Platform-wide user management, system diagnostics, global billing controls. |
| **Agency Admin** | Workspace Manager | Can create workspaces, manage team members, manage subscriptions, approve content. |
| **Content Creator / Editor** | Campaign Developer | Can run Brand DNA scraper, generate strategy roadmaps, render 8K ad visuals, build landing pages. |
| **Client Viewer** | Read & Review Only | Dedicated portal for clients to review, comment on, and approve campaign deliverables at the Approvals Desk. |

---

## 5. Technical Architecture & Stack

* **Frontend Framework**: React 18, Vite 5, Tailwind CSS
* **Icons & UI System**: Lucide React, Glassmorphic UI tokens, Custom Dark/Light theme system
* **Backend Gateway**: Node.js, Express.js
* **Database**: MongoDB (Mongoose Schema Architecture)
* **AI Models**: Google Gemini 3.1 Flash Image, Google Imagen 3, Vertex AI
* **Cloud Storage**: Google Cloud Storage (GCS) V4 Signed URLs

---

## 6. Pricing & Credit Model (INR ₹)

| Plan Name | Price (Monthly) | Price (Yearly Billed) | Visual AI Credits | Key Included Features |
| :--- | :--- | :--- | :--- | :--- |
| **Starter Suite** | ₹799 / mo | ₹639 / mo | 50 Credits / mo | 1 Brand DNA Workspace, 30-Day Strategy, Standard Ad Visuals |
| **Growth Agency** | ₹2,499 / mo | ₹1,999 / mo | 250 Credits / mo | 5 Brand Workspaces, 8K Photorealistic Studio Renders, AI Website Builder, Approvals Desk |
| **Enterprise Scale** | ₹6,999 / mo | ₹5,599 / mo | 1,000 Credits / mo | Unlimited Workspaces, Dedicated Account Manager, Custom API/Webhook Integrations |

---

## 7. API & Integration Specifications

AI ADS™ provides a RESTful API gateway for programmatic campaign generation:

* `GET /api/brands` — Fetch all Brand DNA workspaces.
* `POST /api/brands/scrape` — Initiate automated URL brand identity scraper.
* `POST /api/strategy/generate` — Generate 30-day campaign strategy roadmap.
* `POST /api/creative/generate-visual` — Trigger 2-Agent 8K commercial ad rendering.
* `GET /api/website-builder/export` — Download exported landing page code bundle (ZIP).

---

*© 2026 AI ADS™ Inc. All rights reserved.*
