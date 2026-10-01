const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');

// Helper to translate mongoose readyState number to human-readable text
const getDbStateString = (stateCode) => {
  switch (stateCode) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
};

/**
 * @route   GET /api/health
 * @desc    Basic liveness & readiness check for cloud probes & monitoring
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStateCode = mongoose.connection ? mongoose.connection.readyState : 0;
  res.json({
    status: 'ok',
    service: 'ai-ads-platform',
    version: '2.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    dbState: getDbStateString(dbStateCode)
  });
});

/**
 * @route   GET /api/health/details
 * @desc    Comprehensive system, database, and environment diagnostics for testing
 * @access  Public
 */
router.get('/details', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const dbStateCode = mongoose.connection ? mongoose.connection.readyState : 0;

  let dbPingMs = null;
  if (dbStateCode === 1 && mongoose.connection.db) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      dbPingMs = Date.now() - start;
    } catch (err) {
      dbPingMs = -1;
    }
  }

  res.json({
    status: 'ok',
    service: 'ai-ads-platform',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: {
      processSeconds: Math.floor(process.uptime()),
      systemSeconds: Math.floor(os.uptime())
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      cpus: os.cpus().length,
      memory: {
        rssMB: Math.round(memoryUsage.rss / (1024 * 1024)),
        heapTotalMB: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
        heapUsedMB: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
        externalMB: Math.round(memoryUsage.external / (1024 * 1024)),
        systemFreeMB: Math.round(os.freemem() / (1024 * 1024)),
        systemTotalMB: Math.round(os.totalmem() / (1024 * 1024))
      }
    },
    database: {
      state: getDbStateString(dbStateCode),
      readyState: dbStateCode,
      pingMs: dbPingMs,
      host: mongoose.connection ? mongoose.connection.host || 'N/A' : 'N/A',
      name: mongoose.connection ? mongoose.connection.name || 'N/A' : 'N/A'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000,
      configuredKeys: {
        mongodb: !!process.env.MONGODB_URI,
        jwtSecret: !!process.env.JWT_SECRET,
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
        cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
        smtp: !!process.env.SMTP_HOST
      }
    }
  });
});

/**
 * @route   GET /api/health/db
 * @desc    Dedicated database connection ping test
 * @access  Public
 */
router.get('/db', async (req, res) => {
  const dbStateCode = mongoose.connection ? mongoose.connection.readyState : 0;
  
  if (dbStateCode !== 1 || !mongoose.connection.db) {
    return res.status(503).json({
      status: 'error',
      message: 'Database is not connected',
      dbState: getDbStateString(dbStateCode),
      readyState: dbStateCode
    });
  }

  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const duration = Date.now() - start;

    return res.json({
      status: 'ok',
      message: 'Database connection ping successful',
      pingMs: duration,
      dbState: 'connected',
      databaseName: mongoose.connection.name
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Database ping failed',
      error: err.message,
      dbState: getDbStateString(dbStateCode)
    });
  }
});

/**
 * @route   GET /api/health/ping & POST /api/health/ping
 * @desc    Ping / echo endpoint for verifying API request execution & connectivity
 * @access  Public
 */
const handlePing = (req, res) => {
  const message = req.query.message || (req.body && req.body.message) || 'pong';
  res.json({
    status: 'ok',
    pong: true,
    message,
    timestamp: new Date().toISOString(),
    receivedBody: req.body || null,
    receivedParams: req.query || null
  });
};

router.get('/ping', handlePing);
router.post('/ping', handlePing);

module.exports = router;
