const express = require('express');
const router = express.Router();
const path = require('path');
const WebsiteProject = require('../models/WebsiteProject');
const WebsiteVersion = require('../models/WebsiteVersion');
const storageService = require('../modules/websiteBuilder/services/ProjectStorageService');
const { analyzeRequirement } = require('../modules/websiteBuilder/websiteBuilder.service');

const { generateWebsiteBlueprint } = require('../modules/websiteBuilder/websiteBlueprint.service');

// ─── POST /api/website-builder/analyze ───────────────────────────────────────
router.post('/analyze', async (req, res) => {
  const reqId = req.headers['x-correlation-id'] || req.body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[WB:${reqId}] Backend request received. POST /api/website-builder/analyze`);
  console.log(`[WB:${reqId}] Prompt: "${(req.body.prompt || '').slice(0, 60)}..."`);

  try {
    const { prompt, brandContext = {} } = req.body;
    if (!prompt) {
      console.warn(`[WB:${reqId}] Request validation failed: Missing prompt parameter.`);
      return res.status(400).json({ success: false, error: 'prompt is required', reqId });
    }

    const requirement = await analyzeRequirement(prompt, brandContext, reqId);
    const source = requirement.analysisMetadata?.analysisSource || 'unknown';
    console.log(`[WB:${reqId}] Returning requirement response. analysisSource: ${source}`);

    res.json({ success: true, requirement, reqId });
  } catch (err) {
    console.error(`[WB:${reqId}] Requirement Analysis Route Error:`, err.message);
    res.status(500).json({ success: false, error: err.message, reqId });
  }
});

// ─── POST /api/website-builder/blueprint ─────────────────────────────────────
router.post('/blueprint', async (req, res) => {
  const reqId = req.headers['x-correlation-id'] || req.body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[WB:${reqId}] Backend request received. POST /api/website-builder/blueprint`);

  try {
    const { requirement, approvedRecommendations = [] } = req.body;
    if (!requirement) {
      return res.status(400).json({ success: false, error: 'Requirement object is required', reqId });
    }

    const blueprint = generateWebsiteBlueprint(requirement, approvedRecommendations, reqId);
    console.log(`[WB:${reqId}] Returning Website Blueprint response. Pages count: ${blueprint.pages.length}`);

    res.json({ success: true, blueprint, reqId });
  } catch (err) {
    console.error(`[WB:${reqId}] Website Blueprint Route Error:`, err.message);
    res.status(500).json({ success: false, error: err.message, reqId });
  }
});

const { generateWebsiteFromBlueprint } = require('../modules/websiteBuilder/websiteGenerator.service');

// ─── POST /api/website-builder/generate ─────────────────────────────────────
router.post('/generate', async (req, res) => {
  const reqId = req.headers['x-correlation-id'] || req.body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[WB:${reqId}] Backend request received. POST /api/website-builder/generate`);

  try {
    const { blueprint } = req.body;
    if (!blueprint || typeof blueprint !== 'object') {
      return res.status(400).json({ success: false, error: 'Blueprint object is required', reqId });
    }

    const website = generateWebsiteFromBlueprint(blueprint, reqId);
    console.log(`[WB:${reqId}] Returning Generated Website response. Pages: ${website.pages.length}, Validation Status: ${website.validationResult.status}`);

    res.json({ success: true, website, reqId });
  } catch (err) {
    console.error(`[WB:${reqId}] Website Generator Route Error:`, err.message);
    res.status(500).json({ success: false, error: err.message, reqId });
  }
});

const { runWebsiteBuild } = require('../modules/websiteBuilder/orchestrator/buildOrchestrator.service');

// ─── POST /api/website-builder/build ──────────────────────────────────────────
router.post('/build', async (req, res) => {
  const reqId = req.headers['x-correlation-id'] || req.body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[WB:${reqId}] Backend request received. POST /api/website-builder/build`);

  try {
    const { prompt, brandContext = {}, requirement = null, approvedRecommendations = [], clarificationAnswers = {} } = req.body;

    if (clarificationAnswers && Object.keys(clarificationAnswers).length > 0) {
      brandContext.clarificationAnswers = clarificationAnswers;
    }

    const buildResult = await runWebsiteBuild({
      prompt,
      brandContext,
      requirement,
      approvedRecommendations,
      reqId
    });

    if (!buildResult.success && buildResult.error) {
      return res.status(buildResult.stage === 'phase1' ? 400 : 422).json({
        success: false,
        reqId,
        stage: buildResult.stage,
        error: buildResult.error,
        pipeline: buildResult.pipeline
      });
    }

    // Automatically persist WebsiteProject to repository
    if (buildResult && buildResult.success) {
      const projectId = buildResult.sourceProject?.projectId || buildResult.website?.websiteId || `proj_${Date.now()}`;
      const projectTitle = buildResult.requirement?.proposedIdentity?.name ||
                           buildResult.requirement?.businessType ||
                           buildResult.website?.websiteIdentity?.title ||
                           'Generated Web Application';
      const wsId = req.body.workspaceId || brandContext?.workspaceId || 'default_ws';

      try {
        await WebsiteProject.findOneAndUpdate(
          { projectId },
          {
            projectId,
            workspaceId: wsId,
            title: projectTitle,
            businessType: buildResult.requirement?.businessType || 'Full-Stack App',
            industry: buildResult.requirement?.industry || '',
            status: 'GENERATED',
            activeVersion: 'v1',
            blueprint: buildResult.blueprint,
            website: buildResult.website,
            requirement: buildResult.requirement,
            runtime: buildResult.runtime,
            updatedAt: new Date()
          },
          { upsert: true, returnDocument: 'after' }
        );
        console.log(`[WB:${reqId}] Persisted WebsiteProject document: ${projectId}`);
      } catch (saveErr) {
        console.warn(`[WB:${reqId}] Note: Project persist warning:`, saveErr.message);
      }
    }

    res.json({ success: true, build: buildResult, reqId });
  } catch (err) {
    console.error(`[WB:${reqId}] Build Orchestrator Route Error:`, err.message);
    res.status(500).json({ success: false, error: err.message, reqId });
  }
});

// ─── GET /api/website-builder/projects ───────────────────────────────────────
router.get('/projects', async (req, res) => {
  try {
    const { workspaceId, limit = 50 } = req.query;
    const filter = {};
    if (workspaceId && workspaceId !== 'undefined' && workspaceId !== 'null') {
      filter.$or = [{ workspaceId }, { workspaceId: 'default_ws' }];
    }

    const projects = await WebsiteProject.find(filter)
      .sort({ updatedAt: -1 })
      .limit(Number(limit));

    // Auto-sync titles and identities from disk if siteData.js was modified via chat
    const syncedProjects = projects.map(p => {
      const pObj = p.toObject ? p.toObject() : p;
      try {
        const siteDataPath = path.join(storageService.getProjectVersionPath(pObj.projectId, pObj.activeVersion || 'v1'), 'src/data/siteData.js');
        if (fs.existsSync(siteDataPath)) {
          const raw = fs.readFileSync(siteDataPath, 'utf8');
          const titleMatch = raw.match(/"title":\s*"([^"]+)"/);
          if (titleMatch && titleMatch[1]) {
            pObj.title = titleMatch[1];
            if (pObj.website && pObj.website.websiteIdentity) {
              pObj.website.websiteIdentity.title = titleMatch[1];
            }
          }
        }
      } catch (e) {}
      return pObj;
    });

    res.json({ success: true, projects: syncedProjects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/website-builder/projects ──────────────────────────────────────
router.post('/projects', async (req, res) => {
  try {
    const { workspaceId = 'default_ws', title = 'My Web App', businessType = 'General Store', industry = 'E-Commerce' } = req.body;
    const projectId = `proj_${Date.now()}`;

    const project = await WebsiteProject.create({
      projectId,
      workspaceId,
      title,
      businessType,
      industry,
      status: 'DRAFT',
      activeVersion: 'v1'
    });

    // Create v1 initial version record
    const version = await WebsiteVersion.create({
      projectId,
      version: 'v1',
      changelog: 'Project initialized',
      storagePath: storageService.getProjectVersionPath(projectId, 'v1'),
      fileCount: 0
    });

    res.json({ success: true, project, version });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const fs = require('fs');
const { generateCodeProject } = require('../modules/websiteBuilder/emitter/codeEmitter.service');

async function ensureProjectOnDisk(project) {
  if (!project) return false;
  const projectId = project.projectId;
  const version = project.activeVersion || 'v1';
  const versionDir = storageService.getProjectVersionPath(projectId, version);

  if (fs.existsSync(versionDir)) {
    const files = fs.readdirSync(versionDir);
    if (files.length > 0) return true;
  }

  // Self-heal: reconstruct code from website model or blueprint
  console.log(`[AutoSelfHeal] Emitting missing project files to disk for ${projectId}...`);
  try {
    let websiteModel = project.website;
    let blueprint = project.blueprint;
    let requirement = project.requirement;

    if (!blueprint && requirement) {
      blueprint = generateWebsiteBlueprint(requirement, [], projectId);
    }
    if (!websiteModel && blueprint) {
      websiteModel = generateWebsiteFromBlueprint(blueprint, projectId);
    }

    if (websiteModel) {
      websiteModel.websiteId = projectId;
      generateCodeProject(websiteModel, blueprint || {}, requirement || {}, projectId);
      console.log(`[AutoSelfHeal] Successfully emitted code project for ${projectId}`);
      return true;
    }
  } catch (err) {
    console.error(`[AutoSelfHeal Error] Failed to emit ${projectId}:`, err.message);
  }

  return false;
}

// ─── GET /api/website-builder/projects/:id ────────────────────────────────────
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await WebsiteProject.findOne({ projectId: req.params.id });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    await ensureProjectOnDisk(project);

    // Sync siteData.js title and identity from disk
    const projectDir = storageService.getProjectVersionPath(project.projectId, project.activeVersion || 'v1');
    const siteDataPath = path.join(projectDir, 'src/data/siteData.js');
    if (fs.existsSync(siteDataPath)) {
      try {
        const raw = fs.readFileSync(siteDataPath, 'utf8');
        const titleMatch = raw.match(/"title":\s*"([^"]+)"/);
        if (titleMatch && titleMatch[1]) {
          project.title = titleMatch[1];
          if (project.website && project.website.websiteIdentity) {
            project.website.websiteIdentity.title = titleMatch[1];
          }
        }
      } catch (e) {}
    }

    // Auto-ensure Live Sandbox Runtime is running for this project
    let runtime = projectSandboxService.getProjectStatus(project.projectId);
    if (!runtime || runtime.status !== 'RUNNING' || !runtime.url) {
      if (fs.existsSync(projectDir)) {
        try {
          runtime = await projectSandboxService.runProjectInSandbox({
            projectId: project.projectId,
            projectDir,
            forceRebuild: false
          });
        } catch (e) {
          console.warn(`[WB:GET /projects/:id] Auto-start runtime note for ${project.projectId}:`, e.message);
        }
      }
    }

    if (runtime && runtime.status === 'RUNNING') {
      project.runtime = runtime;
      if (project.website) {
        project.website.runtime = runtime;
      }
    }

    const versions = await WebsiteVersion.find({ projectId: req.params.id }).sort({ createdAt: -1 });
    const artifacts = storageService.loadVersionArtifacts(req.params.id, project.activeVersion || 'v1');

    res.json({ success: true, project, runtime, versions, files: artifacts.files || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/website-builder/projects/:id/export-zip ─────────────────────────
router.get('/projects/:id/export-zip', async (req, res) => {
  try {
    const project = await WebsiteProject.findOne({ projectId: req.params.id });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    await ensureProjectOnDisk(project);

    const title = project?.websiteIdentity?.title || project?.title || 'website-app';
    const version = project?.activeVersion || 'v1';

    storageService.exportProjectZip(req.params.id, version, res, title);
  } catch (err) {
    console.error('[ExportZIP Error]', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// ─── GET /api/website-builder/projects/:id/files ──────────────────────────────
router.get('/projects/:id/files', async (req, res) => {
  try {
    const project = await WebsiteProject.findOne({ projectId: req.params.id });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    await ensureProjectOnDisk(project);

    const version = project?.activeVersion || req.query.version || 'v1';
    const artifacts = storageService.loadVersionArtifacts(req.params.id, version);

    if (!artifacts.success) {
      return res.status(404).json({ success: false, error: artifacts.error });
    }

    res.json({ success: true, files: artifacts.files || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/website-builder/projects/:id ─────────────────────────────────
router.delete('/projects/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const filter = isMongoId ? { $or: [{ projectId: id }, { _id: id }] } : { projectId: id };

    const project = await WebsiteProject.findOne(filter);
    const pid = project?.projectId || id;

    // 1. Stop sandbox runtime if running
    try {
      await projectSandboxService.stopProject(pid);
    } catch (e) {
      // Ignore sandbox stop errors
    }

    // 2. Delete database records
    await WebsiteProject.deleteMany(filter);
    await WebsiteVersion.deleteMany({ projectId: pid });

    // 3. Remove disk storage directory
    const projectDir = path.join(storageService.baseStorageDir, pid);
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    console.log(`[WB:DELETE] Successfully deleted project ${pid}`);
    res.json({ success: true, message: `Project ${pid} deleted successfully` });
  } catch (err) {
    console.error(`[WB:DELETE Error] Failed to delete ${id}:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const projectSandboxService = require('../modules/websiteBuilder/sandbox/projectSandbox.service');

// ─── GET /api/website-builder/projects/:id/runtime ────────────────────────────
router.get('/projects/:id/runtime', async (req, res) => {
  const projectId = req.params.id;
  let runtime = projectSandboxService.getProjectStatus(projectId);
  if (!runtime || runtime.status !== 'RUNNING' || !runtime.url) {
    const projectDir = storageService.getProjectVersionPath(projectId, 'v1');
    if (fs.existsSync(projectDir)) {
      try {
        runtime = await projectSandboxService.runProjectInSandbox({
          projectId,
          projectDir,
          forceRebuild: false
        });
      } catch (e) {
        console.warn(`[WB:Runtime] Auto-start on GET runtime failed for ${projectId}:`, e.message);
      }
    }
  }
  res.json({ success: true, runtime });
});

// ─── POST /api/website-builder/projects/:id/runtime/start ─────────────────────
router.post('/projects/:id/runtime/start', async (req, res) => {
  const projectId = req.params.id;
  const projectDir = storageService.getProjectVersionPath(projectId, 'v1');
  if (!fs.existsSync(projectDir)) {
    return res.status(404).json({ success: false, error: 'Project directory not found on disk' });
  }
  try {
    const runtime = await projectSandboxService.runProjectInSandbox({
      projectId,
      projectDir,
      forceRebuild: req.body.forceRebuild || false
    });
    res.json({ success: true, runtime });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/website-builder/projects/:id/runtime/stop ───────────────────────
router.post('/projects/:id/runtime/stop', async (req, res) => {
  const projectId = req.params.id;
  const result = await projectSandboxService.stopProject(projectId);
  res.json({ success: true, result });
});

// ─── GET /api/website-builder/projects/:id/preview* ───────────────────────────
router.get('/projects/:id/preview*', async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectDir = storageService.getProjectVersionPath(projectId, 'v1');
    const distDir = path.join(projectDir, 'dist');

    // Option 1: Serve compiled static assets from dist folder if dist exists
    if (fs.existsSync(distDir)) {
      let subPath = req.params[0] || '/index.html';
      if (!subPath || subPath === '/') subPath = '/index.html';

      const filePath = path.join(distDir, subPath);
      if (fs.existsSync(filePath) && filePath.startsWith(distDir)) {
        return res.sendFile(filePath);
      }
      const distIndex = path.join(distDir, 'index.html');
      if (fs.existsSync(distIndex)) {
        return res.sendFile(distIndex);
      }
    }

    // Option 2: Standalone Dynamic HTML Fallback Preview
    const project = await WebsiteProject.findOne({ projectId });
    const htmlContent = generateStandalonePreviewHtml(project, projectId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(htmlContent);
  } catch (err) {
    console.error('[WB:Preview Route Error]', err);
    res.status(500).send('Error rendering website preview');
  }
});

function generateStandalonePreviewHtml(project, projectId) {
  let title = project?.websiteIdentity?.title || project?.title || 'Website Preview';
  let brandName = project?.websiteIdentity?.title || project?.title || 'Brand';
  let siteDataObj = null;

  try {
    const projectDir = storageService.getProjectVersionPath(projectId, 'v1');
    const siteDataPath = path.join(projectDir, 'src/data/siteData.js');
    if (fs.existsSync(siteDataPath)) {
      const raw = fs.readFileSync(siteDataPath, 'utf8');
      const objMatch = raw.match(/export\s+const\s+siteData\s*=\s*(\{[\s\S]*\});?\s*$/);
      if (objMatch && objMatch[1]) {
        siteDataObj = JSON.parse(objMatch[1]);
      }
    }
  } catch (e) {}

  if (siteDataObj && siteDataObj.websiteIdentity?.title) {
    title = siteDataObj.websiteIdentity.title;
    brandName = siteDataObj.websiteIdentity.title;
  }

  const pages = siteDataObj?.pages || project?.website?.pages || project?.blueprint?.pages || [
    { title: 'Home Page', path: '/' },
    { title: 'Catalog', path: '/catalog' },
    { title: 'Our Story', path: '/about' }
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .panch-bg { background-color: #090d16; }
    .gold-gradient { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); }
  </style>
</head>
<body class="panch-bg text-slate-100 min-h-screen">
  <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">
        ${brandName.charAt(0).toUpperCase()}
      </div>
      <div>
        <h1 class="font-extrabold text-lg tracking-tight text-white">${brandName}</h1>
        <span class="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">Live Application Preview</span>
      </div>
    </div>
    <nav class="hidden md:flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
      ${pages.map((p, idx) => `
        <button onclick="switchTab(${idx})" id="nav-btn-${idx}" class="nav-tab px-4 py-2 rounded-xl text-xs font-bold transition-all ${idx === 0 ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}">
          ${p.title || p.name || `Page ${idx + 1}`}
        </button>
      `).join('')}
    </nav>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-12 space-y-16">
    <section class="text-center space-y-6 max-w-3xl mx-auto py-8">
      <span class="px-4 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-block">
        Official AI Generated Platform
      </span>
      <h2 class="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
        Welcome to <span class="text-transparent bg-clip-text gold-gradient">${brandName}</span>
      </h2>
      <p class="text-base text-slate-300 font-medium">
        Experience high-performance, prompt-tailored digital interactions built live with Panch Tattva architecture.
      </p>
      <div class="flex items-center justify-center gap-4 pt-4">
        <a href="#catalog" class="px-7 py-3.5 rounded-2xl gold-gradient text-slate-950 font-black text-sm shadow-xl hover:opacity-90 transition-all">
          Explore Experience
        </a>
        <a href="#contact" class="px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm transition-all">
          Contact Team &rarr;
        </a>
      </div>
    </section>

    <section id="catalog" class="space-y-8">
      <div class="text-center space-y-2">
        <h3 class="text-2xl font-extrabold text-white">Featured Offerings & Services</h3>
        <p class="text-xs text-slate-400">Curated showcase automatically tailored to your brand requirement.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-amber-500/40 transition-all">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">✦</div>
          <h4 class="text-lg font-bold text-white">Artisanal Quality</h4>
          <p class="text-xs text-slate-400">Crafted with precision, ensuring sustainable performance and aesthetic excellence.</p>
          <span class="text-xs font-bold text-amber-400 block pt-2">₹1,499</span>
        </div>

        <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-amber-500/40 transition-all">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">⚡</div>
          <h4 class="text-lg font-bold text-white">Instant Customization</h4>
          <p class="text-xs text-slate-400">Adaptive configurations and live natural-language editing capabilities.</p>
          <span class="text-xs font-bold text-amber-400 block pt-2">₹2,999</span>
        </div>

        <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-amber-500/40 transition-all">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">🛡️</div>
          <h4 class="text-lg font-bold text-white">Verified Security</h4>
          <p class="text-xs text-slate-400">Built-in component isolation, clean routing, and production readiness.</p>
          <span class="text-xs font-bold text-amber-400 block pt-2">Included</span>
        </div>
      </div>
    </section>

    <section id="contact" class="p-8 md:p-12 rounded-3xl bg-slate-950 border border-slate-800 space-y-6 max-w-2xl mx-auto">
      <div class="space-y-2 text-center">
        <h3 class="text-2xl font-extrabold text-white">Connect With Us</h3>
        <p class="text-xs text-slate-400">Send an inquiry directly to the ${brandName} team.</p>
      </div>
      <form onsubmit="alert('Thank you! Your inquiry has been sent.'); return false;" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Your Name</label>
          <input type="text" required placeholder="John Doe" class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
          <input type="email" required placeholder="john@example.com" class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Message</label>
          <textarea rows="3" required placeholder="How can we help you?" class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"></textarea>
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl gold-gradient text-slate-950 font-black text-xs shadow-lg hover:opacity-90 transition-all">
          Submit Message &rarr;
        </button>
      </form>
    </section>
  </main>

  <footer class="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
    <p>&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved. Powered by AI ADS Platform.</p>
  </footer>

  <script>
    function switchTab(idx) {
      document.querySelectorAll('.nav-tab').forEach((el, i) => {
        if (i == idx) {
          el.className = 'nav-tab px-4 py-2 rounded-xl text-xs font-bold transition-all bg-amber-500 text-slate-950 shadow-md';
        } else {
          el.className = 'nav-tab px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white';
        }
      });
    }
  </script>
</body>
</html>`;
}

const { analyzeClarificationNeed } = require('../modules/websiteBuilder/services/clarificationAnalyzer.service');
const { processChatEditRequest } = require('../modules/websiteBuilder/services/chatEditInterpreter.service');

// ─── POST /api/website-builder/clarify ─────────────────────────────────────────
router.post('/clarify', async (req, res) => {
  const reqId = req.headers['x-correlation-id'] || req.body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[WB:${reqId}] POST /api/website-builder/clarify request received.`);

  try {
    const { prompt, brandContext = {} } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'prompt is required', reqId });
    }

    const clarification = await analyzeClarificationNeed(prompt, brandContext, reqId);
    res.json({ success: true, clarification, reqId });
  } catch (err) {
    console.error(`[WB:${reqId}] Clarification Route Error:`, err.message);
    res.status(500).json({ success: false, error: err.message, reqId });
  }
});

// ─── POST /api/website-builder/chat-edit ──────────────────────────────────────
router.post('/chat-edit', async (req, res) => {
  const reqId = req.headers['x-correlation-id'] || req.body.reqId || `wb_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[WB:${reqId}] POST /api/website-builder/chat-edit request received.`);

  try {
    const { projectId, userPrompt, activeRequirement, activeBlueprint } = req.body;
    if (!projectId || !userPrompt) {
      return res.status(400).json({ success: false, error: 'projectId and userPrompt are required', reqId });
    }

    const editResult = await processChatEditRequest({
      projectId,
      userPrompt,
      activeRequirement,
      activeBlueprint,
      reqId
    });

    if (editResult && editResult.success) {
      try {
        const updateFields = {
          status: 'MODIFIED',
          updatedAt: new Date()
        };
        if (editResult.updatedTitle) {
          updateFields.title = editResult.updatedTitle;
        }
        if (editResult.updatedWebsite) {
          updateFields.website = editResult.updatedWebsite;
        } else {
          if (editResult.updatedTitle) {
            updateFields['website.websiteIdentity.title'] = editResult.updatedTitle;
          }
          if (editResult.updatedDesignSpec) {
            updateFields['website.designSpec'] = editResult.updatedDesignSpec;
          }
        }
        if (editResult.runtime) {
          updateFields.runtime = editResult.runtime;
        }
        await WebsiteProject.findOneAndUpdate(
          { projectId },
          { $set: updateFields },
          { returnDocument: 'after' }
        );
        console.log(`[WB:${reqId}] Auto-saved updated project '${projectId}' to MongoDB successfully.`);
      } catch (dbErr) {
        console.warn(`[WB:${reqId}] DB update note on chat edit:`, dbErr.message);
      }
    }

    res.json({ success: true, result: editResult, reqId });
  } catch (err) {
    console.error(`[WB:${reqId}] Chat Edit Route Error:`, err.message);
    res.status(500).json({ success: false, error: err.message, reqId });
  }
});

module.exports = router;


