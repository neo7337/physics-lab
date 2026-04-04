// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  n:          1,        // harmonic mode
  T:          2.0,      // tension (N)
  mu:         0.010,    // linear mass density (kg/m)
  L:          1.0,      // string length (m)
  amplitude:  1.0,
  damping:    0.0,      // damping coefficient (0 = undamped)
  animSpeed:  1.0,
  animate:    true,
  showEnvelope: true,
  showNodes:    true,
  time:       0,        // physics time (seconds)
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
function waveSpeed()   { return Math.sqrt(state.T / state.mu); }
function fundamentalF(){ return waveSpeed() / (2 * state.L); }
function harmonicF()   { return state.n * fundamentalF(); }
function wavelength()  { return 2 * state.L / state.n; }

/**
 * y(x, t) for the nth standing wave mode with optional exponential damping.
 * y = A · e^{-damping·t} · sin(nπx/L) · cos(ω·t)
 */
function stringY(x, t) {
  const omega = 2 * Math.PI * harmonicF();
  const kn    = state.n * Math.PI / state.L;
  const damp  = Math.exp(-state.damping * t);
  return state.amplitude * damp * Math.sin(kn * x) * Math.cos(omega * t);
}

// ─── String Canvas ────────────────────────────────────────────────────────────
function drawString() {
  const W = waveCanvas.width;
  const H = waveCanvas.height;
  if (W <= 0 || H <= 0) return;

  wCtx.clearRect(0, 0, W, H);
  wCtx.fillStyle = '#050810';
  wCtx.fillRect(0, 0, W, H);

  const PAD_X = 60;
  const cy = H / 2;
  const stringLen = W - 2 * PAD_X;
  const scaleY = (H * 0.35) / state.amplitude;  // px per amplitude unit

  const nPts = Math.max(W, 400);

  // ── Envelope (dashed, ±A·sin(nπx/L)) ──────────────────────────────────────
  if (state.showEnvelope) {
    const damp = Math.exp(-state.damping * state.time);
    wCtx.save();
    wCtx.setLineDash([4, 5]);
    wCtx.strokeStyle = 'rgba(255,255,255,0.18)';
    wCtx.lineWidth = 1.5;

    // Positive envelope
    wCtx.beginPath();
    for (let i = 0; i <= nPts; i++) {
      const xFrac = i / nPts;
      const x_phys = xFrac * state.L;
      const kn = state.n * Math.PI / state.L;
      const env = state.amplitude * damp * Math.abs(Math.sin(kn * x_phys));
      const px = PAD_X + xFrac * stringLen;
      const py = cy - env * scaleY;
      i === 0 ? wCtx.moveTo(px, py) : wCtx.lineTo(px, py);
    }
    wCtx.stroke();

    // Negative envelope
    wCtx.beginPath();
    for (let i = 0; i <= nPts; i++) {
      const xFrac = i / nPts;
      const x_phys = xFrac * state.L;
      const kn = state.n * Math.PI / state.L;
      const env = state.amplitude * damp * Math.abs(Math.sin(kn * x_phys));
      const px = PAD_X + xFrac * stringLen;
      const py = cy + env * scaleY;
      i === 0 ? wCtx.moveTo(px, py) : wCtx.lineTo(px, py);
    }
    wCtx.stroke();
    wCtx.setLineDash([]);
    wCtx.restore();
  }

  // ── Draw string (with color gradient based on displacement) ────────────────
  wCtx.save();
  for (let i = 0; i < nPts; i++) {
    const xFrac  = i / nPts;
    const x_phys = xFrac * state.L;
    const y      = stringY(x_phys, state.time);
    const px     = PAD_X + xFrac * stringLen;
    const py     = cy - y * scaleY;

    // Color: near-zero displacement = dim, max displacement = bright cyan/orange
    const normY = Math.abs(y) / (state.amplitude + 0.001);
    const r = Math.round(normY * 80);
    const g = Math.round(130 + normY * 80);
    const b = Math.round(200 + normY * 55);
    wCtx.strokeStyle = `rgb(${r},${g},${b})`;
    wCtx.lineWidth = 2.5;

    if (i === 0) { wCtx.beginPath(); wCtx.moveTo(px, py); }
    else wCtx.lineTo(px, py);
  }
  wCtx.stroke();
  wCtx.restore();

  // ── Fixed endpoints ─────────────────────────────────────────────────────────
  [[PAD_X, 'LEFT'], [PAD_X + stringLen, 'RIGHT']].forEach(([x, side]) => {
    wCtx.fillStyle = '#58a6ff';
    wCtx.beginPath(); wCtx.arc(x, cy, 6, 0, 2 * Math.PI); wCtx.fill();
    wCtx.fillStyle = '#1c2333';
    wCtx.beginPath(); wCtx.arc(x, cy, 3, 0, 2 * Math.PI); wCtx.fill();
  });
  // Walls
  wCtx.fillStyle = '#2a3a50';
  wCtx.fillRect(PAD_X - 14, cy - 20, 14, 40);
  wCtx.fillRect(PAD_X + stringLen, cy - 20, 14, 40);
  wCtx.strokeStyle = '#58a6ff';
  wCtx.lineWidth = 1.5;
  wCtx.strokeRect(PAD_X - 14, cy - 20, 14, 40);
  wCtx.strokeRect(PAD_X + stringLen, cy - 20, 14, 40);

  // ── Node and antinode markers ───────────────────────────────────────────────
  if (state.showNodes) {
    const n = state.n;
    // Nodes: x = k * L/n for k = 0..n
    for (let k = 0; k <= n; k++) {
      const x_phys = k * state.L / n;
      const px = PAD_X + (x_phys / state.L) * stringLen;
      wCtx.beginPath(); wCtx.arc(px, cy, 4, 0, 2 * Math.PI);
      wCtx.fillStyle = '#f85149'; wCtx.fill();
      wCtx.font = '9px monospace'; wCtx.fillStyle = '#f8514988';
      wCtx.textAlign = 'center';
      wCtx.fillText('N', px, cy - 12);
    }
    // Antinodes: x = (2k-1) * L/(2n) for k = 1..n
    for (let k = 1; k <= n; k++) {
      const x_phys = (2*k - 1) * state.L / (2 * n);
      const px = PAD_X + (x_phys / state.L) * stringLen;
      const y  = stringY(x_phys, state.time);
      const py = cy - y * scaleY;
      wCtx.beginPath(); wCtx.arc(px, py, 4, 0, 2 * Math.PI);
      wCtx.fillStyle = '#3fb950'; wCtx.fill();
      wCtx.font = '9px monospace'; wCtx.fillStyle = '#3fb95088';
      wCtx.textAlign = 'center';
      wCtx.fillText('AN', px, py - 10);
    }
  }

  // ── Info labels ─────────────────────────────────────────────────────────────
  wCtx.save();
  wCtx.font = 'bold 11px monospace'; wCtx.fillStyle = '#58a6ffcc'; wCtx.textAlign = 'center';
  wCtx.fillText(`n = ${state.n}  (Harmonic ${state.n})`, W / 2, 16);
  wCtx.font = '10px monospace'; wCtx.fillStyle = '#8b949e';
  wCtx.fillText(`f = ${harmonicF().toFixed(2)} Hz`, W / 2, 30);
  wCtx.restore();

  // String length label
  wCtx.save();
  wCtx.font = '9px monospace'; wCtx.fillStyle = 'rgba(255,255,255,0.4)'; wCtx.textAlign = 'center';
  wCtx.fillText(`L = ${state.L.toFixed(1)} m`, W / 2, H - 6);
  wCtx.restore();
}

// ─── Frequency Spectrum Graph ─────────────────────────────────────────────────
function drawSpectrumGraph() {
  const W = graphCanvas.width;
  const H = graphCanvas.height;
  if (W <= 0 || H <= 0) return;

  gCtx.clearRect(0, 0, W, H);
  gCtx.fillStyle = '#050810'; gCtx.fillRect(0, 0, W, H);

  const PAD_L = 50, PAD_R = 20, PAD_T = 16, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const maxOrder = 8;
  const f1 = fundamentalF();

  // Axes
  gCtx.strokeStyle = '#30363d'; gCtx.lineWidth = 1;
  gCtx.beginPath(); gCtx.moveTo(PAD_L, PAD_T); gCtx.lineTo(PAD_L, PAD_T+plotH);
  gCtx.lineTo(PAD_L+plotW, PAD_T+plotH); gCtx.stroke();

  gCtx.fillStyle = '#8b949e'; gCtx.font = '10px monospace'; gCtx.textAlign = 'center';
  gCtx.fillText('Harmonic frequency (Hz)', PAD_L + plotW / 2, H - 4);
  gCtx.save(); gCtx.translate(12, PAD_T + plotH / 2); gCtx.rotate(-Math.PI / 2);
  gCtx.fillText('Amplitude', 0, 0); gCtx.restore();

  const barW   = Math.floor(plotW / maxOrder * 0.5);
  const spacing = plotW / maxOrder;
  const damp   = Math.exp(-state.damping * state.time);

  for (let k = 1; k <= maxOrder; k++) {
    const freq  = k * f1;
    const amp   = k === state.n ? state.amplitude * damp : 0;  // only active mode
    const barH  = amp * plotH;
    const bx    = PAD_L + (k - 0.5) * spacing - barW / 2;
    const by    = PAD_T + plotH - barH;

    // Bar
    const isActive = k === state.n;
    gCtx.fillStyle = isActive ? 'rgba(88,166,255,0.85)' : 'rgba(88,166,255,0.15)';
    gCtx.fillRect(bx, by, barW, barH);
    gCtx.strokeStyle = isActive ? '#58a6ff' : '#30363d';
    gCtx.lineWidth = 1;
    gCtx.strokeRect(bx, by, barW, barH);

    // Frequency label
    gCtx.font = '9px monospace'; gCtx.fillStyle = isActive ? '#58a6ff' : '#8b949e';
    gCtx.textAlign = 'center';
    gCtx.fillText(`n=${k}`, bx + barW / 2, PAD_T + plotH + 12);
    if (freq < 1000) gCtx.fillText(`${freq.toFixed(0)}Hz`, bx + barW / 2, PAD_T + plotH + 22);
  }
}

// ─── Formula Panel Updates ─────────────────────────────────────────────────────
function updateFormulaPanel() {
  const v  = waveSpeed();
  const f1 = fundamentalF();
  const fn = harmonicF();
  const wl = wavelength();
  const n  = state.n;

  document.getElementById('wave-speed-val').textContent = `v = ${v.toFixed(2)} m/s`;
  document.getElementById('f1-val').textContent         = `f₁ = ${f1.toFixed(2)} Hz`;
  document.getElementById('fn-val').textContent         = `f${n} = ${fn.toFixed(2)} Hz`;
  document.getElementById('p-n').textContent   = `${n}`;
  document.getElementById('p-T').textContent   = `${state.T.toFixed(1)} N`;
  document.getElementById('p-mu').textContent  = `${state.mu.toFixed(3)} kg/m`;
  document.getElementById('p-L').textContent   = `${state.L.toFixed(1)} m`;
  document.getElementById('p-lambda').textContent = `${wl.toFixed(4)} m`;

  // Node/antinode table
  const table = document.getElementById('node-table');
  table.innerHTML = '';
  for (let k = 0; k <= n; k++) {
    const x_n = k * state.L / n;
    const tr = document.createElement('tr');
    tr.className = 'maxima';
    tr.innerHTML = `<td style="color:#f85149">N${k}</td><td>x = ${x_n.toFixed(3)} m</td>`;
    table.appendChild(tr);
  }
  for (let k = 1; k <= n; k++) {
    const x_an = (2*k - 1) * state.L / (2 * n);
    const tr = document.createElement('tr');
    tr.className = 'maxima';
    tr.innerHTML = `<td style="color:#3fb950">AN${k}</td><td>x = ${x_an.toFixed(3)} m</td>`;
    table.appendChild(tr);
  }
}

// ─── Controls Wiring ──────────────────────────────────────────────────────────
function wireControls() {
  const bind = (id, key, format, scale = 1) => {
    const el    = document.getElementById(id);
    const valEl = document.getElementById(`${id}-val`);
    el.addEventListener('input', () => {
      state[key] = parseFloat(el.value) * scale;
      if (valEl) valEl.textContent = format(parseFloat(el.value));
      updateFormulaPanel();
    });
  };
  bind('tension',        'T',         v => `${(+v).toFixed(1)} N`,      1);
  bind('linear-density', 'mu',        v => `${(+v).toFixed(3)} kg/m`,   1);
  bind('str-length',     'L',         v => `${(+v).toFixed(1)} m`,       1);
  bind('amplitude',      'amplitude', v => `${(+v).toFixed(1)}`,         1);
  bind('damping',        'damping',   v => `${(+v).toFixed(2)}`,         1);
  bind('anim-speed',     'animSpeed', v => `${(+v).toFixed(1)}×`,        1);

  document.getElementById('toggle-anim').addEventListener('change', e => { state.animate = e.target.checked; });
  document.getElementById('toggle-envelope').addEventListener('change', e => { state.showEnvelope = e.target.checked; });
  document.getElementById('toggle-nodes').addEventListener('change', e => { state.showNodes = e.target.checked; });

  // Mode buttons
  document.getElementById('mode-buttons').addEventListener('click', e => {
    if (e.target.classList.contains('mode-btn')) {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.n = parseInt(e.target.dataset.mode);
      state.time = 0;  // reset time on mode change for clean start
      updateFormulaPanel();
    }
  });
}

// ─── Animation Loop ───────────────────────────────────────────────────────────
let lastTime = 0;
function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  if (state.animate) state.time += dt * state.animSpeed;
  drawString();
  drawSpectrumGraph();
  requestAnimationFrame(loop);
}

function init() {
  resizeCanvases();
  wireControls();
  updateFormulaPanel();
  requestAnimationFrame(loop);
}
window.addEventListener('load', init);
