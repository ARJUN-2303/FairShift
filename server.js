'use strict';

// FairShift server (Phase 2).
// Serves the existing frontend from /public and exposes a few small API routes.
// Firebase Authentication and Firestore are NOT connected yet (that is Phase 3).

const fs = require('fs');
const path = require('path');
const express = require('express');

const PUBLIC_DIR = path.join(__dirname, 'public');

function createApp() {
  const app = express();
  app.disable('x-powered-by');

  // Basic security headers. A full Content-Security-Policy comes later, because
  // the current frontend still uses inline scripts and event handlers.
  app.use(function (req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '100kb' }));

  // Used by Cloud Run and by you to check the server is alive.
  app.get('/healthz', function (req, res) {
    res.status(200).json({ status: 'ok' });
  });

  // Honest status. These values stay false/"not configured" until Phase 3
  // actually connects Firebase and a real check succeeds.
  app.get('/api/status', function (req, res) {
    res.json({
      app: 'FairShift',
      phase: 2,
      firebaseConfigured: false,
      authentication: 'not configured: the sign-in screen is still a demo',
      database: 'not connected: data is still stored in the browser only'
    });
  });

  // Any other /api route does not exist yet.
  app.use('/api', function (req, res) {
    res.status(404).json({ error: 'not_found' });
  });

  // The existing website (index.html and anything else in /public).
  app.use(express.static(PUBLIC_DIR, { index: 'index.html', dotfiles: 'ignore' }));

  // Safe error handler: logs only the error message, never request bodies.
  // eslint-disable-next-line no-unused-vars
  app.use(function (err, req, res, next) {
    console.error('Unhandled error:', err && err.message);
    res.status(500).json({ error: 'server_error' });
  });

  return app;
}

module.exports = { createApp };

// Start listening only when run directly (npm start), not when tests import this file.
if (require.main === module) {
  // Fail early with a clear message if the folder structure is wrong.
  if (!fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))) {
    console.error('Cannot find public/index.html. Your folder structure is wrong: index.html must be inside the "public" folder (see README, "Check the folder structure").');
    process.exit(1);
  }
  const port = Number(process.env.PORT) || 8080;
  const server = createApp().listen(port, '0.0.0.0', function () {
    console.log('FairShift listening on port ' + port);
  });
  // Cloud Run sends SIGTERM when it stops an instance.
  process.on('SIGTERM', function () {
    server.close(function () { process.exit(0); });
  });
}
