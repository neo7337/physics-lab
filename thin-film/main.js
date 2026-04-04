// ─── Polyfill: CanvasRenderingContext2D.roundRect ─────────────────────────────
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + w - radius, y);
    this.arcTo(x + w, y, x + w, y + radius, radius);
    this.lineTo(x + w, y + h - radius);
    this.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    this.lineTo(x + radius, y + h);
    this.arcTo(x, y + h, x, y + h - radius, radius);
    this.lineTo(x, y + radius);
    this.arcTo(x, y, x + radius, y, radius);
    this.closePath();
  };
}

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  lambda:      550e-9,  // wavelength (m)
  t:           275e-9,  // film thickness (m)
  n:           1.50,    // film refractive index
  nSub:        1.52,    // substrate refractive index
  nAir:        1.00,    // incident medium
  theta:       0,       // incident angle (degrees)
  animSpeed:   1.0,
  animate:     true,
  showSpectrum:true,
  phase:       0,
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
function wavelengthToRGB(wl) {
  let r, g, b, factor;
  if      (wl >= 380 && wl < 440) { r = -(wl-440)/60;  g = 0;            b = 1; }
  else if (wl >= 440 && wl < 490) { r = 0;              g = (wl-440)/50;  b = 1; }
  else if (wl >= 490 && wl < 510) { r = 0;              g = 1;            b = -(wl-510)/20; }
  else if (wl >= 510 && wl < 580) { r = (wl-510)/70;    g = 1;            b = 0; }
  else if (wl >= 580 && wl < 645) { r = 1;              g = -(wl-645)/65; b = 0; }
  else if (wl >= 645 && wl <= 750){ r = 1;              g = 0;            b = 0; }
  else { r = 0; g = 0; b = 0; }
  if      (wl >= 380 && wl < 420) factor = 0.3 + 0.7*(wl-380)/40;
  else if (wl >= 700 && wl <= 750) factor = 0.3 + 0.7*(750-wl)/50;
  else factor = 1.0;
  return [Math.round(255*r*factor), Math.round(255*g*factor), Math.round(255*b*factor)];
}

/**
 * Returns the reflectance R at a given wavelength (m) for the thin film.
 * Uses the two-beam approximation (Airy function):
 *   OPD = 2 * n_film * t * cos(theta_t)
 *   Phase shifts: +π when going from low-n to high-n medium
 *   R = r₁² + r₂² + 2r₁r₂cos(δ) / (1 + r₁²r₂² + 2r₁r₂cos(δ))
 *     where δ = 2π·OPD/λ + phase_shifts_contribution
 * Simplified: Fabry-Perot 2-beam approximation.
 */
function reflectance(lambda, t, n, nSub, nAir, thetaDeg) {
  const thetaI = thetaDeg * Math.PI / 180;
  // Snell's law: nAir·sin(θI) = n·sin(θT)
  const sinThT = (nAir / n) * Math.sin(thetaI);
  if (Math.abs(sinThT) > 1) return 0; // total internal... not applicable here
  const cosThT = Math.sqrt(1 - sinThT * sinThT);

  // Fresnel reflection coefficients (amplitude), s-polarization (average for unpolarized):
  const cosThI = Math.cos(thetaI);
  // r12 (air→film): amplitude reflection at top surface
  const r12 = (nAir * cosThI - n * cosThT) / (nAir * cosThI + n * cosThT);
  // r23 (film→substrate): amplitude reflection at bottom surface
  const cosThS = Math.sqrt(Math.max(0, 1 - ((n/nSub)*sinThT)**2));
  const r23 = (n * cosThT - nSub * cosThS) / (n * cosThT + nSub * cosThS);

  // OPD and round-trip phase
  const OPD = 2 * n * t * cosThT;
  const delta = (2 * Math.PI * OPD / lambda);

  // Thin-film reflectance (two-beam):
  const R12 = r12 * r12;
  const R23 = r23 * r23;
  const num = R12 + R23 + 2 * Math.sqrt(R12 * R23) * Math.cos(delta);
  const den = 1 + R12 * R23 + 2 * Math.sqrt(R12 * R23) * Math.cos(delta);
  return Math.min(1, Math.max(0, num / den));
}

function getOPD() {
  const thetaI = state.theta * Math.PI / 180;
  const sinThT = (state.nAir / state.n) * Math.sin(thetaI);
  const cosThT = Math.sqrt(Math.max(0, 1 - sinThT * sinThT));
  return 2 * state.n * state.t * cosThT;
}

function getThetaT() {
  const thetaI = state.theta * Math.PI / 180;
  const sinThT = (state.nAir / state.n) * Math.sin(thetaI);
  return Math.asin(Math.min(1, Math.abs(sinThT))) * 180 / Math.PI;
}

// ─── Wave Field / Ray Diagram Rendering ──────────────────────────────────────
function drawWaveField() {
  const W = waveCanvas.width;
  const H = waveCanvas.height;
  if (W <= 0 || H <= 0) return;

  wCtx.clearRect(0, 0, W, H);
  wCtx.fillStyle = '#050810';
  wCtx.fillRect(0, 0, W, H);

  const cx = W / 2;

  // Film geometry: film region in middle third of canvas height
  const filmTop    = Math.floor(H * 0.25);
  const filmBottom = Math.floor(H * 0.65);
  const filmHeight = filmBottom - filmTop;

  // ── Draw substrate ──
  wCtx.fillStyle = '#1a2035';
  wCtx.fillRect(0, filmBottom, W, H - filmBottom);
  wCtx.strokeStyle = '#3a5080';
  wCtx.lineWidth = 1;
  wCtx.strokeRect(0, filmBottom, W, H - filmBottom);

  // Substrate label
  wCtx.save(); wCtx.font = '11px monospace'; wCtx.fillStyle = '#4a6fa5'; wCtx.textAlign = 'center';
  wCtx.fillText(`Substrate  n₂ = ${state.nSub.toFixed(2)}`, cx, filmBottom + 20); wCtx.restore();

  // ── Draw film ──
  const OPD    = getOPD();
  const R_cur  = reflectance(state.lambda, state.t, state.n, state.nSub, state.nAir, state.theta);
  const [wr, wg, wb] = wavelengthToRGB(state.lambda * 1e9);
  const filmAlpha = 0.12 + R_cur * 0.3;
  wCtx.fillStyle = `rgba(${wr},${wg},${wb},${filmAlpha})`;
  wCtx.fillRect(0, filmTop, W, filmHeight);
  wCtx.strokeStyle = '#58a6ff55';
  wCtx.lineWidth = 1.5;
  wCtx.strokeRect(0, filmTop, W, filmHeight);

  // Film label
  wCtx.save(); wCtx.font = '11px monospace'; wCtx.fillStyle = '#58a6ffcc'; wCtx.textAlign = 'center';
  wCtx.fillText(`Film  n = ${state.n.toFixed(2)},  t = ${(state.t*1e9).toFixed(0)} nm`, cx, filmTop + filmHeight/2 + 4);
  wCtx.restore();

  // Air label
  wCtx.save(); wCtx.font = '11px monospace'; wCtx.fillStyle = '#8b949e'; wCtx.textAlign = 'center';
  wCtx.fillText(`Air  n₀ = ${state.nAir.toFixed(2)}`, cx, filmTop - 12); wCtx.restore();

  // ── Draw animated rays ──
  const thetaI_rad = state.theta * Math.PI / 180;
  const sinThT_val = (state.nAir / state.n) * Math.sin(thetaI_rad);
  const cosThT_val = Math.sqrt(Math.max(0, 1 - sinThT_val * sinThT_val));
  const thetaT_rad = Math.asin(Math.min(1, Math.abs(sinThT_val)));

  // Incident ray hits film top at cx
  const incLen   = filmTop - 10;
  const incDx    = Math.sin(thetaI_rad);
  const incDy    = Math.cos(thetaI_rad);
  const hitX     = cx;
  const hitY     = filmTop;
  const incStartX = hitX - incDx * incLen;
  const incStartY = hitY - incDy * incLen;

  // Animated phase offset on incident ray
  const phase = state.phase;
  const drawAnimatedRay = (x1, y1, x2, y2, color, isReflected = false) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);
    const nx = dx/len, ny = dy/len;
    const spacing = 24;
    const nWaves = Math.ceil(len / spacing) + 2;

    wCtx.save();
    wCtx.strokeStyle = color;
    wCtx.lineWidth = 2;
    wCtx.globalAlpha = 0.85;
    // Main ray line
    wCtx.beginPath(); wCtx.moveTo(x1,y1); wCtx.lineTo(x2,y2); wCtx.stroke();

    // Wave crests as perpendicular tick marks
    wCtx.lineWidth = 1.5;
    const offset = (phase * spacing * 0.3) % spacing;
    for (let i = 0; i < nWaves; i++) {
      const d = i * spacing - offset;
      if (d < 0 || d > len) continue;
      const wx = x1 + nx * d;
      const wy = y1 + ny * d;
      const px2 = -ny * 5, py2 = nx * 5;
      wCtx.beginPath();
      wCtx.moveTo(wx - px2, wy - py2); wCtx.lineTo(wx + px2, wy + py2); wCtx.stroke();
    }
    wCtx.restore();
  };

  // Incident ray
  drawAnimatedRay(incStartX, incStartY, hitX, hitY, '#88aaff');

  // Reflected ray 1 (from top surface)
  const ref1EndX = hitX + incDx * incLen;
  const ref1EndY = hitY - incDy * incLen;
  drawAnimatedRay(hitX, hitY, ref1EndX, ref1EndY, '#ffaa44', true);

  // Refracted ray through film
  const filmExitX = hitX + Math.sin(thetaT_rad) * filmHeight;
  const filmExitY = filmBottom;
  drawAnimatedRay(hitX, hitY, filmExitX, filmExitY, '#44ff8888');

  // Reflected ray 2 from bottom surface going back up
  const ref2TopX = filmExitX + Math.sin(thetaT_rad) * filmHeight;
  const ref2TopY = filmTop;
  drawAnimatedRay(filmExitX, filmExitY, ref2TopX, ref2TopY, '#ffcc44aa', true);

  // Transmitted ray below substrate
  const transLen = H - filmBottom - 20;
  const transEndX = filmExitX + incDx * transLen * 0.6;
  const transEndY = filmBottom + transLen * 0.6;
  drawAnimatedRay(filmExitX, filmExitY, transEndX, transEndY, '#44ff88');

  // ── Reflectance indicator ──
  const boxX = W - 140, boxY = 14;
  wCtx.fillStyle = '#161b22cc'; wCtx.strokeStyle = '#30363d'; wCtx.lineWidth = 1;
  wCtx.beginPath(); wCtx.roundRect(boxX, boxY, 130, 60, 6); wCtx.fill(); wCtx.stroke();
  wCtx.save(); wCtx.font = 'bold 10px monospace'; wCtx.fillStyle = '#8b949e';
  wCtx.fillText('REFLECTANCE', boxX + 10, boxY + 16);
  wCtx.font = 'bold 20px monospace'; wCtx.fillStyle = R_cur > 0.5 ? '#f0c040' : '#3fb950';
  wCtx.fillText((R_cur * 100).toFixed(1) + '%', boxX + 10, boxY + 40);
  wCtx.restore();

  // OPD indicator
  const opd2X = 12, opd2Y = 14;
  wCtx.fillStyle = '#161b22cc'; wCtx.strokeStyle = '#30363d'; wCtx.lineWidth = 1;
  wCtx.beginPath(); wCtx.roundRect(opd2X, opd2Y, 150, 60, 6); wCtx.fill(); wCtx.stroke();
  wCtx.save(); wCtx.font = 'bold 10px monospace'; wCtx.fillStyle = '#8b949e';
  wCtx.fillText('OPD', opd2X + 10, opd2Y + 16);
  wCtx.font = 'bold 14px monospace'; wCtx.fillStyle = '#58a6ff';
  wCtx.fillText(`${(OPD*1e9).toFixed(1)} nm`, opd2X + 10, opd2Y + 40);
  wCtx.restore();
}

// ─── Spectrum Graph ────────────────────────────────────────────────────────────
function drawSpectrumGraph() {
  const W = graphCanvas.width;
  const H = graphCanvas.height;
  if (W <= 0 || H <= 0) return;

  gCtx.clearRect(0, 0, W, H);
  gCtx.fillStyle = '#050810'; gCtx.fillRect(0, 0, W, H);

  const PAD_L = 40, PAD_R = 16, PAD_T = 12, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  // Axes
  gCtx.strokeStyle = '#30363d'; gCtx.lineWidth = 1;
  gCtx.beginPath(); gCtx.moveTo(PAD_L, PAD_T); gCtx.lineTo(PAD_L, PAD_T+plotH);
  gCtx.lineTo(PAD_L+plotW, PAD_T+plotH); gCtx.stroke();

  gCtx.fillStyle = '#8b949e'; gCtx.font = '10px monospace'; gCtx.textAlign = 'center';
  gCtx.fillText('Wavelength (nm)', PAD_L + plotW / 2, H - 4);
  gCtx.save(); gCtx.translate(10, PAD_T + plotH / 2); gCtx.rotate(-Math.PI / 2);
  gCtx.fillText('Reflectance', 0, 0); gCtx.restore();

  // Wavelength tick labels
  gCtx.font = '9px monospace'; gCtx.fillStyle = '#8b949e'; gCtx.textAlign = 'center';
  [400, 450, 500, 550, 600, 650, 700].forEach(wl => {
    const px = PAD_L + (wl - 380) / (750 - 380) * plotW;
    gCtx.fillText(`${wl}`, px, H - 4 + 0); // reuse bottom label space
  });

  // Spectrum fill — draw each pixel column with wavelength color, height = R
  const nPts = plotW;
  for (let i = 0; i < nPts; i++) {
    const wl = 380 + (i / nPts) * (750 - 380);
    const R  = reflectance(wl * 1e-9, state.t, state.n, state.nSub, state.nAir, state.theta);
    const [r, g, b] = wavelengthToRGB(wl);
    const px = PAD_L + i;
    const barH = R * plotH;
    gCtx.fillStyle = `rgba(${r},${g},${b},0.7)`;
    gCtx.fillRect(px, PAD_T + plotH - barH, 1, barH);
  }

  // Curve outline
  gCtx.beginPath();
  let first = true;
  for (let i = 0; i <= nPts; i++) {
    const wl = 380 + (i / nPts) * (750 - 380);
    const R  = reflectance(wl * 1e-9, state.t, state.n, state.nSub, state.nAir, state.theta);
    const px = PAD_L + i;
    const py = PAD_T + plotH - R * plotH;
    if (first) { gCtx.moveTo(px, py); first = false; } else gCtx.lineTo(px, py);
  }
  gCtx.strokeStyle = 'rgba(255,255,255,0.6)'; gCtx.lineWidth = 1.5; gCtx.stroke();

  // Current wavelength marker
  const curPx = PAD_L + (state.lambda * 1e9 - 380) / (750 - 380) * plotW;
  gCtx.strokeStyle = 'rgba(255,255,255,0.8)'; gCtx.lineWidth = 1;
  gCtx.setLineDash([3,4]);
  gCtx.beginPath(); gCtx.moveTo(curPx, PAD_T); gCtx.lineTo(curPx, PAD_T + plotH); gCtx.stroke();
  gCtx.setLineDash([]);
  gCtx.font = 'bold 9px monospace'; gCtx.fillStyle = '#fff'; gCtx.textAlign = 'center';
  gCtx.fillText(`${(state.lambda*1e9).toFixed(0)} nm`, curPx, PAD_T + 9);
}

// ─── Formula Panel Updates ─────────────────────────────────────────────────────
function updateFormulaPanel() {
  const { lambda, t, n, nSub, nAir, theta } = state;
  const OPD = getOPD();
  const thetaT = getThetaT();
  const R = reflectance(lambda, t, n, nSub, nAir, theta);

  // Phase shift logic
  const top_high = n > nAir;    // air→film: phase flip if n > nAir
  const bot_high = nSub > n;    // film→sub: phase flip if nSub > n
  const totalFlips = (top_high ? 1 : 0) + (bot_high ? 1 : 0);
  let phaseNote, constructiveFormula;
  if (totalFlips === 1) {
    phaseNote = 'One π phase flip → destructive at 2nt = mλ';
    constructiveFormula = '2nt cos θₜ = (m+½)λ';
  } else if (totalFlips === 2) {
    phaseNote = 'Two π phase flips (cancel) → constructive at 2nt = mλ';
    constructiveFormula = '2nt cos θₜ = mλ';
  } else {
    phaseNote = 'No phase flips → constructive at 2nt = mλ';
    constructiveFormula = '2nt cos θₜ = mλ';
  }

  document.getElementById('opd-val').textContent = `OPD = ${(OPD*1e9).toFixed(2)} nm`;
  document.getElementById('phase-shift-note').textContent = phaseNote;
  document.getElementById('constructive-formula').textContent = constructiveFormula;
  document.getElementById('reflectance-val').textContent = `R = ${(R*100).toFixed(2)}%`;
  document.getElementById('p-lambda').textContent = `${(lambda*1e9).toFixed(0)} nm`;
  document.getElementById('p-t').textContent      = `${(t*1e9).toFixed(0)} nm`;
  document.getElementById('p-n').textContent      = `${n.toFixed(2)}`;
  document.getElementById('p-nsub').textContent   = `${nSub.toFixed(2)}`;
  document.getElementById('p-theta').textContent  = `${theta.toFixed(0)}°`;
  document.getElementById('p-thetat').textContent = `${thetaT.toFixed(2)}°`;

  // Constructive orders
  const cosThT = Math.cos(getThetaT() * Math.PI / 180);
  const table = document.getElementById('orders-table');
  table.innerHTML = '';
  const halfShift = totalFlips === 1;
  for (let m = 0; m <= 6; m++) {
    const wl_m = halfShift
      ? (2 * n * t * cosThT) / (m + 0.5)
      : m > 0 ? (2 * n * t * cosThT) / m : Infinity;
    if (wl_m < 100e-9 || wl_m > 2000e-9) continue;
    const inVis = wl_m >= 380e-9 && wl_m <= 750e-9;
    const tr = document.createElement('tr');
    tr.className = 'maxima';
    tr.innerHTML = `<td>m=${m}</td><td style="color:${inVis?'#3fb950':'#8b949e'}">${(wl_m*1e9).toFixed(1)} nm${inVis?' ✓':''}</td>`;
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
  bind('wavelength', 'lambda',    v => `${v} nm`,              1e-9);
  bind('thickness',  't',         v => `${v} nm`,              1e-9);
  bind('n-film',     'n',         v => `${(+v).toFixed(2)}`,   1);
  bind('n-sub',      'nSub',      v => `${(+v).toFixed(2)}`,   1);
  bind('angle',      'theta',     v => `${v}°`,                1);
  bind('anim-speed', 'animSpeed', v => `${(+v).toFixed(1)}×`,  1);

  document.getElementById('toggle-anim').addEventListener('change', e => { state.animate = e.target.checked; });
  document.getElementById('toggle-spectrum').addEventListener('change', e => { state.showSpectrum = e.target.checked; });
}

// ─── Animation Loop ───────────────────────────────────────────────────────────
let lastTime = 0;
function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  if (state.animate) state.phase += dt * state.animSpeed * 3.0;
  drawWaveField();
  if (state.showSpectrum) drawSpectrumGraph();
  requestAnimationFrame(loop);
}

function init() {
  resizeCanvases();
  wireControls();
  updateFormulaPanel();
  requestAnimationFrame(loop);
}
window.addEventListener('load', init);
