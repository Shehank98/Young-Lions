/**
 * PULSE — Live Sync Server
 *
 * Endpoints:
 *   GET  /api/state   → { stage, taps }
 *   POST /api/stage   → body: { stage: 0-6 }
 *   POST /api/tap     → increments tap count
 *   POST /api/reset   → resets to stage 0, taps 0
 *
 * Serves:
 *   /            → index.html  (audience phones)
 *   /presenter   → presenter.html (big screen)
 */

const express = require('express');
const path    = require('path');
const app     = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── In-memory state (resets if server restarts) ──────────────
let state = { stage: 0, taps: 0 };

// ── API ───────────────────────────────────────────────────────
app.get('/api/state', (_req, res) => {
  res.json(state);
});

app.post('/api/stage', (req, res) => {
  const s = parseInt(req.body?.stage);
  if (isNaN(s) || s < 0 || s > 6) return res.status(400).json({ error: 'invalid stage' });
  state.stage = s;
  console.log(`[PULSE] Stage → ${s}`);
  res.json({ ok: true, stage: s });
});

app.post('/api/tap', (_req, res) => {
  state.taps++;
  console.log(`[PULSE] Tap #${state.taps}`);
  res.json({ taps: state.taps });
});

app.post('/api/reset', (_req, res) => {
  state = { stage: 0, taps: 0 };
  console.log('[PULSE] Reset');
  res.json({ ok: true });
});

// ── Presenter route ───────────────────────────────────────────
app.get('/presenter', (_req, res) => {
  res.sendFile(path.join(__dirname, 'presenter.html'));
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🩸 PULSE is live`);
  console.log(`   Audience  → http://localhost:${PORT}/`);
  console.log(`   Presenter → http://localhost:${PORT}/presenter\n`);
});
