// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  fs:          440,    // source frequency (Hz)
  vs:          0,      // source velocity (m/s), positive = rightward
  vo:          0,      // observer velocity (m/s), positive = rightward
  v:           343,    // wave speed (m/s)
  animSpeed:   1.0,
  animate:     true,
  showWavefronts: true,
  showMach:    true,
  time:        0,      // physics time (seconds)
};

// ─── Canvas Setup ─────────────────────────────────────────────────────────────
const waveCanvas  = document.getElementById('wave-canvas');
const graphCanvas = document.getElementById('graph-canvas');
const wCtx = waveCanvas.getContext('2d');
const gCtx = graphCanvas.getContext('2d');

function resizeCanvases() {
  const wRect = waveCanvas.parentElement.getBoundingClientRect();
  const gRect = graphCanvas.parentElement.getBoundingClientRect();
  waveCanvas.width   = Math.floor(wRect.width  - 2);
  waveCanvas.height  = Math.floor(wRect.height - 30);
  graphCanvas.width  = Math.floor(gRect.width  - 2);
  graphCanvas.height = Math.floor(gRect.height - 30);
}
window.addEventListener('resize', resizeCanvases);

// ─── Physics ──────────────────────────────────────────────────────────────────
/**
 * Exact Doppler formula.
 * Sign convention: source moving toward observer → denominator shrinks → f_obs↑
 * Here we compute for specific observer direction.
 *
 * @param {number} vsComponent  projection of source velocity toward observer (+= toward)
 * @param {number} voComponent  projection of observer velocity toward source  (+= toward)
 */
function dopplerFreq(vsComponent, voComponent) {
  const denom = state.v - vsComponent;
  if (Math.abs(denom) < 0.01) return Infinity; // sonic singularity
  return state.fs * (state.v + voComponent) / denom;
}

function machNumber() { return Math.abs(state.vs) / state.v; }

function machAngleDeg() {
  const M = machNumber();
  if (M <= 1) return null;
  return (Math.asin(1 / M) * 180 / Math.PI);
}

// ─── Wavefront Ring Store ──────────────────────────────────────────────────────
// Each ring: { emitTime, emitX } (emitted at physics time emitTime from source position emitX)
const rings = [];
let   lastEmitTime = 0;

function emitInterval() {
  return 1 / state.fs;   // one period
}

// ─── Wave Field Canvas ─────────────────────────────────────────────────────────
// Source starts at center-left; observer is at center-right.
// We represent positions in "world units" where 1 unit = some canvas fraction.

function drawWaveField(sourceX_px, sourceY_px, observerX_px, observerY_px) {
  const W = waveCanvas.width;
  const H = waveCanvas.height;
  if (W <= 0 || H <= 0) return;

  wCtx.clearRect(0, 0, W, H);
  wCtx.fillStyle = '#050810';
  wCtx.fillRect(0, 0, W, H);

  // ── Grid ──────────────────────────────────────────────────────────────────
  wCtx.strokeStyle = '#0d1a2a';
  wCtx.lineWidth = 1;
  const gridSpacing = 40;
  for (let x = 0; x < W; x += gridSpacing) {
    wCtx.beginPath(); wCtx.moveTo(x, 0); wCtx.lineTo(x, H); wCtx.stroke();
  }
  for (let y = 0; y < H; y += gridSpacing) {
    wCtx.beginPath(); wCtx.moveTo(0, y); wCtx.lineTo(W, y); wCtx.stroke();
  }

  // Scale: world units to pixels — 1 unit = pxPerUnit px
  // We'll define world space: origin at canvas center.
  // Source starts at x = -0.3 * worldW, observer at x = +0.3 * worldW.
  // Wave speed covers worldW/2 in worldW/(2v) seconds.
  // For visualization, let pxPerUnit make wave rings visible.
  const pxPerUnit = W / 14;   // 14 "units" across the canvas

  // ── Wavefront rings ───────────────────────────────────────────────────────
  if (state.showWavefronts) {
    const now = state.time;
    rings.forEach(ring => {
      const age    = now - ring.emitTime;
      if (age < 0) return;
      const radius = age * state.v * pxPerUnit / state.v;   // age * v, scaled
      // radius in pixels = age * (v in world-units/sec) * pxPerUnit
      // world-unit speed = state.v / state.v = 1 world-unit/sec at base
      // Actually: let world speed = 1 unit/sec when state.v = 343 m/s
      const radiusPx = age * pxPerUnit;   // 1 world-unit/s for ring expansion; we'll normalize
      // More precisely: radius_px = age * state.v * (pxPerUnit / state.v) = age * pxPerUnit
      // Yes: radius_px = age * pxPerUnit (world-speed = 1 unit/s, pxPerUnit px/unit)

      const cx = ring.emitX_px;
      const cy = ring.emitY_px;
      const r  = age * pxPerUnit;  // exact — wave expands at 1 world-unit/s

      if (r > W * 1.5) return;  // off-screen, skip

      // Fade older rings
      const alpha = Math.max(0, 0.7 - age * 0.18);
      wCtx.beginPath();
      wCtx.arc(cx, cy, r, 0, 2 * Math.PI);
      wCtx.strokeStyle = `rgba(88,166,255,${alpha.toFixed(2)})`;
      wCtx.lineWidth = 1.2;
      wCtx.stroke();
    });
  }

  // ── Mach cone ─────────────────────────────────────────────────────────────
  const M = machNumber();
  if (state.showMach && M > 1) {
    const halfAngle = Math.asin(1 / M);
    // Draw cone lines from current source position backward
    const coneLength = W * 0.7;
    const dx = Math.cos(Math.PI - halfAngle) * coneLength;
    const dyUp  = -Math.sin(halfAngle) * coneLength;
    const dyDn  =  Math.sin(halfAngle) * coneLength;

    // Direction the source is moving
    const dir = state.vs >= 0 ? 1 : -1;
    const backDx = -dir * Math.cos(halfAngle) * coneLength;
    const absDy  = Math.sin(halfAngle) * coneLength;

    wCtx.save();
    wCtx.strokeStyle = 'rgba(248,81,73,0.65)';
    wCtx.lineWidth = 1.5;
    wCtx.setLineDash([6, 5]);
    wCtx.beginPath();
    wCtx.moveTo(sourceX_px, sourceY_px);
    wCtx.lineTo(sourceX_px + backDx, sourceY_px - absDy);
    wCtx.stroke();
    wCtx.beginPath();
    wCtx.moveTo(sourceX_px, sourceY_px);
    wCtx.lineTo(sourceX_px + backDx, sourceY_px + absDy);
    wCtx.stroke();
    wCtx.setLineDash([]);
    wCtx.restore();

    // Label
    wCtx.fillStyle = '#f85149aa';
    wCtx.font = '10px monospace';
    wCtx.textAlign = 'center';
    wCtx.fillText(`M = ${M.toFixed(2)} — shock wave`, sourceX_px + backDx * 0.5, sourceY_px - absDy * 0.5 - 8);
  }

  // ── Source ─────────────────────────────────────────────────────────────────
  wCtx.beginPath(); wCtx.arc(sourceX_px, sourceY_px, 8, 0, 2 * Math.PI);
  wCtx.fillStyle = '#58a6ff';  wCtx.fill();
  wCtx.strokeStyle = '#fff'; wCtx.lineWidth = 1.5; wCtx.stroke();

  // Velocity arrow for source
  if (Math.abs(state.vs) > 0) {
    const arrowLen = Math.min(Math.abs(state.vs) * pxPerUnit * 0.12, 80);
    const dir = Math.sign(state.vs);
    drawArrow(wCtx, sourceX_px, sourceY_px, sourceX_px + dir * arrowLen, sourceY_px, '#58a6ff');
  }

  wCtx.fillStyle = '#e6edf3';
  wCtx.font = 'bold 10px monospace';
  wCtx.textAlign = 'center';
  wCtx.fillText('S', sourceX_px, sourceY_px + 3);

  // ── Observer ───────────────────────────────────────────────────────────────
  wCtx.beginPath(); wCtx.arc(observerX_px, observerY_px, 8, 0, 2 * Math.PI);
  wCtx.fillStyle = '#3fb950'; wCtx.fill();
  wCtx.strokeStyle = '#fff'; wCtx.lineWidth = 1.5; wCtx.stroke();

  if (Math.abs(state.vo) > 0) {
    const arrowLen = Math.min(Math.abs(state.vo) * pxPerUnit * 0.12, 60);
    const dir = Math.sign(state.vo);
    drawArrow(wCtx, observerX_px, observerY_px, observerX_px + dir * arrowLen, observerY_px, '#3fb950');
  }

  wCtx.fillStyle = '#e6edf3';
  wCtx.font = 'bold 10px monospace';
  wCtx.textAlign = 'center';
  wCtx.fillText('O', observerX_px, observerY_px + 3);

  // ── Labels ─────────────────────────────────────────────────────────────────
  wCtx.fillStyle = '#8b949e';
  wCtx.font = '10px monospace';
  wCtx.textAlign = 'center';
  wCtx.fillText(`f_s = ${state.fs} Hz`, sourceX_px, sourceY_px - 16);
  const fObs = observedFreqAtObserver();
  wCtx.fillStyle = isFinite(fObs) ? '#3fb950' : '#f85149';
  wCtx.fillText(isFinite(fObs) ? `f_o = ${fObs.toFixed(1)} Hz` : 'f_o = ∞ (sonic!)', observerX_px, observerY_px - 16);
}

function drawArrow(ctx, x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 8;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  ctx.restore();
}

// ─── Frequency at Observer ─────────────────────────────────────────────────────
function observedFreqAtObserver() {
  // Source moving right (+vs), observer to the right of source:
  // observer is ahead of source → source approaching → vs component = +vs (toward observer)
  // observer moving right (+vo) away from source → vo component = -vo (away from source)
  // But we use the standard formula: f_o = fs * (v + vo_toward) / (v - vs_toward)
  // "toward" means toward the other party.
  // If observer is to the right of source:
  //   vs_toward_observer = +vs (moving right = moving toward observer on right)
  //   vo_toward_source   = -vo (moving right = moving away from source on left)
  const vs_component = state.vs;   // positive = toward observer (on right)
  const vo_component = -state.vo;  // positive = toward source (on left), so moving right (away) is negative
  return dopplerFreq(vs_component, vo_component);
}

// ─── Frequency Bar Graph ───────────────────────────────────────────────────────
function drawFreqGraph() {
  const W = graphCanvas.width;
  const H = graphCanvas.height;
  if (W <= 0 || H <= 0) return;

  gCtx.clearRect(0, 0, W, H);
  gCtx.fillStyle = '#050810'; gCtx.fillRect(0, 0, W, H);

  const PAD_L = 60, PAD_R = 20, PAD_T = 16, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  // Axes
  gCtx.strokeStyle = '#30363d'; gCtx.lineWidth = 1;
  gCtx.beginPath();
  gCtx.moveTo(PAD_L, PAD_T); gCtx.lineTo(PAD_L, PAD_T + plotH);
  gCtx.lineTo(PAD_L + plotW, PAD_T + plotH); gCtx.stroke();

  gCtx.fillStyle = '#8b949e'; gCtx.font = '10px monospace'; gCtx.textAlign = 'center';
  gCtx.fillText('Frequency comparison', PAD_L + plotW / 2, H - 4);

  const fAhead  = dopplerFreq(+state.vs, 0);
  const fBehind = dopplerFreq(-state.vs, 0);
  const fObs    = observedFreqAtObserver();

  const bars = [
    { label: 'f source',  value: state.fs,  color: '#58a6ff' },
    { label: 'f ahead',   value: isFinite(fAhead)  ? fAhead  : 0, color: '#f0c040' },
    { label: 'f behind',  value: isFinite(fBehind) ? fBehind : 0, color: '#f78166' },
    { label: 'f observer',value: isFinite(fObs)    ? fObs    : 0, color: '#3fb950' },
  ];

  const maxF = Math.max(...bars.map(b => b.value), state.fs * 2, 100);
  const barW   = Math.floor(plotW / bars.length * 0.5);
  const spacing = plotW / bars.length;

  bars.forEach((bar, i) => {
    const barH = (bar.value / maxF) * plotH;
    const bx   = PAD_L + (i + 0.5) * spacing - barW / 2;
    const by   = PAD_T + plotH - barH;

    gCtx.fillStyle = bar.color + 'cc';
    gCtx.fillRect(bx, by, barW, barH);
    gCtx.strokeStyle = bar.color;
    gCtx.lineWidth = 1;
    gCtx.strokeRect(bx, by, barW, barH);

    // Value label above bar
    gCtx.fillStyle = bar.color;
    gCtx.font = '9px monospace';
    gCtx.textAlign = 'center';
    gCtx.fillText(`${Math.round(bar.value)} Hz`, bx + barW / 2, by - 3);

    // Axis label
    gCtx.fillStyle = '#8b949e';
    gCtx.font = '8px monospace';
    gCtx.fillText(bar.label, bx + barW / 2, PAD_T + plotH + 12);
  });

  // Frequency scale labels on y-axis
  gCtx.fillStyle = '#8b949e'; gCtx.font = '9px monospace'; gCtx.textAlign = 'right';
  for (let tick = 0; tick <= 4; tick++) {
    const f  = (tick / 4) * maxF;
    const py = PAD_T + plotH - (f / maxF) * plotH;
    gCtx.fillText(`${Math.round(f)}`, PAD_L - 4, py + 3);
    gCtx.strokeStyle = '#1c2333'; gCtx.lineWidth = 1;
    gCtx.beginPath(); gCtx.moveTo(PAD_L, py); gCtx.lineTo(PAD_L + plotW, py); gCtx.stroke();
  }
}

// ─── Formula Panel Updates ─────────────────────────────────────────────────────
function updateFormulaPanel() {
  const M   = machNumber();
  const ang = machAngleDeg();
  const fAhead  = dopplerFreq(+state.vs, 0);
  const fBehind = dopplerFreq(-state.vs, 0);
  const fObs    = observedFreqAtObserver();

  document.getElementById('mach-val').textContent     = `M = ${M.toFixed(3)}`;
  document.getElementById('mach-angle-val').textContent = ang !== null
    ? `θ = ${ang.toFixed(1)}° (supersonic)`
    : `M ≤ 1 — no shock wave`;

  document.getElementById('p-fs').textContent = `${state.fs} Hz`;
  document.getElementById('p-vs').textContent = `${state.vs} m/s`;
  document.getElementById('p-vo').textContent = `${state.vo} m/s`;
  document.getElementById('p-v').textContent  = `${state.v} m/s`;
  document.getElementById('p-M').textContent  = M.toFixed(3);

  document.getElementById('f-ahead').textContent    = isFinite(fAhead)  ? `${fAhead.toFixed(1)} Hz`  : '∞';
  document.getElementById('f-behind').textContent   = isFinite(fBehind) ? `${fBehind.toFixed(1)} Hz` : '∞';
  document.getElementById('f-observer').textContent = isFinite(fObs)    ? `${fObs.toFixed(1)} Hz`    : '∞';
}

// ─── Controls Wiring ──────────────────────────────────────────────────────────
function wireControls() {
  const bind = (id, key, format) => {
    const el    = document.getElementById(id);
    const valEl = document.getElementById(`${id}-val`);
    el.addEventListener('input', () => {
      state[key] = parseFloat(el.value);
      if (valEl) valEl.textContent = format(parseFloat(el.value));
      updateFormulaPanel();
      // Reset rings on major parameter change to avoid stale geometry
      if (key === 'vs' || key === 'v' || key === 'fs') {
        rings.length = 0;
        lastEmitTime = state.time;
      }
    });
  };
  bind('source-freq',   'fs',        v => `${(+v).toFixed(0)} Hz`);
  bind('source-vel',    'vs',        v => `${(+v).toFixed(0)} m/s`);
  bind('observer-vel',  'vo',        v => `${(+v).toFixed(0)} m/s`);
  bind('wave-speed',    'v',         v => `${(+v).toFixed(0)} m/s`);
  bind('anim-speed',    'animSpeed', v => `${(+v).toFixed(1)}×`);

  document.getElementById('toggle-anim').addEventListener('change', e => { state.animate = e.target.checked; });
  document.getElementById('toggle-wavefronts').addEventListener('change', e => { state.showWavefronts = e.target.checked; });
  document.getElementById('toggle-mach').addEventListener('change', e => { state.showMach = e.target.checked; });
}

// ─── Positions ─────────────────────────────────────────────────────────────────
// Source and observer positions in pixels, updated each frame.
let sourcePosX = 0;
let observerPosX = 0;

// ─── Animation Loop ───────────────────────────────────────────────────────────
let lastTimestamp = 0;
function loop(timestamp) {
  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05) * (state.animate ? state.animSpeed : 0);
  lastTimestamp = timestamp;

  if (state.animate) {
    state.time += dt;

    const W = waveCanvas.width;
    const H = waveCanvas.height;
    const pxPerUnit = W / 14;

    // Update source position (wrap at edges)
    sourcePosX += state.vs * dt * pxPerUnit / state.v;
    // Clamp source between 10% and 90% of canvas width
    if (sourcePosX < W * 0.05)  sourcePosX = W * 0.05;
    if (sourcePosX > W * 0.95)  sourcePosX = W * 0.95;

    observerPosX += state.vo * dt * pxPerUnit / state.v;
    if (observerPosX < W * 0.05)  observerPosX = W * 0.05;
    if (observerPosX > W * 0.95)  observerPosX = W * 0.95;

    // Emit new wavefront rings at each period
    const period = emitInterval();
    while (state.time - lastEmitTime >= period) {
      lastEmitTime += period;
      rings.push({
        emitTime:  lastEmitTime,
        emitX_px:  sourcePosX,
        emitY_px:  H / 2,
      });
    }

    // Prune old rings (off-screen)
    const maxAge = (Math.max(W, H) * 1.5) / pxPerUnit;
    while (rings.length > 0 && (state.time - rings[0].emitTime) > maxAge) {
      rings.shift();
    }
    // Safety: cap ring count
    if (rings.length > 300) rings.splice(0, rings.length - 300);
  }

  const W = waveCanvas.width, H = waveCanvas.height;
  drawWaveField(sourcePosX, H / 2, observerPosX, H / 2);
  drawFreqGraph();
  requestAnimationFrame(loop);
}

function init() {
  resizeCanvases();
  const W = waveCanvas.width;
  const H = waveCanvas.height;
  // Initial positions: source at 35%, observer at 65%
  sourcePosX   = W * 0.35;
  observerPosX = W * 0.65;
  wireControls();
  updateFormulaPanel();
  requestAnimationFrame(loop);
}
window.addEventListener('load', init);
// Re-init positions on resize
window.addEventListener('resize', () => {
  const W = waveCanvas.width;
  sourcePosX   = W * 0.35;
  observerPosX = W * 0.65;
  rings.length = 0;
  lastEmitTime = state.time;
});
