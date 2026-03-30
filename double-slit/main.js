// ─── Polyfill: CanvasRenderingContext2D.roundRect (Safari < 15.4, older Chrome)
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
  lambda:     550e-9,   // wavelength in metres
  d:          1e-3,     // slit separation in metres
  a:          0.1e-3,   // slit width in metres
  L:          1.0,      // screen distance in metres
  amplitude:  1.0,      // wave amplitude multiplier
  animSpeed:  1.0,      // animation speed multiplier
  animate:    true,     // wave animation on/off
  showLabels: true,     // fringe labels on/off
  phase:      0,        // running phase for animation (radians)
};

// ─── Canvas Setup ─────────────────────────────────────────────────────────────
const waveCanvas  = document.getElementById('wave-canvas');
const graphCanvas = document.getElementById('graph-canvas');
const wCtx  = waveCanvas.getContext('2d');
const gCtx  = graphCanvas.getContext('2d');

function resizeCanvases() {
  const wRect = waveCanvas.parentElement.getBoundingClientRect();
  const gRect = graphCanvas.parentElement.getBoundingClientRect();
  waveCanvas.width  = Math.floor(wRect.width  - 2);  // -2 for border
  waveCanvas.height = Math.floor(wRect.height - 30);  // -30 for label
  graphCanvas.width  = Math.floor(gRect.width  - 2);
  graphCanvas.height = Math.floor(gRect.height - 30);
}

window.addEventListener('resize', () => { resizeCanvases(); });

// ─── Physics ──────────────────────────────────────────────────────────────────

/**
 * Convert wavelength (nm) to an sRGB [r,g,b] array (0-255).
 * Approximation based on the visible spectrum.
 */
function wavelengthToRGB(wl) {
  // wl in nm
  let r, g, b, factor;
  if      (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; g = 0;                     b = 1; }
  else if (wl >= 440 && wl < 490) { r = 0;                  g = (wl - 440) / 50;      b = 1; }
  else if (wl >= 490 && wl < 510) { r = 0;                  g = 1;                     b = -(wl - 510) / 20; }
  else if (wl >= 510 && wl < 580) { r = (wl - 510) / 70;   g = 1;                     b = 0; }
  else if (wl >= 580 && wl < 645) { r = 1;                  g = -(wl - 645) / 65;      b = 0; }
  else if (wl >= 645 && wl <= 750){ r = 1;                  g = 0;                     b = 0; }
  else { r = 0; g = 0; b = 0; }

  // Intensity rolloff at spectrum edges
  if      (wl >= 380 && wl < 420) factor = 0.3 + 0.7 * (wl - 380) / 40;
  else if (wl >= 700 && wl <= 750) factor = 0.3 + 0.7 * (750 - wl) / 50;
  else factor = 1.0;

  return [
    Math.round(255 * r * factor),
    Math.round(255 * g * factor),
    Math.round(255 * b * factor),
  ];
}

/** sinc(x) = sin(πx)/(πx) */
function sinc(x) {
  if (Math.abs(x) < 1e-10) return 1;
  const px = Math.PI * x;
  return Math.sin(px) / px;
}

/**
 * Double-slit intensity at screen position y (metres from centre).
 * Includes single-slit envelope (sinc²).
 * @returns intensity in [0, 1]
 */
function intensity(y, lambda, d, a, L, amplitude) {
  const sinTheta = y / Math.sqrt(y * y + L * L);
  const delta    = d * sinTheta;                     // path difference (m)
  const phase    = Math.PI * delta / lambda;         // interference phase
  const envelope = sinc(a * sinTheta / lambda);      // single-slit envelope
  const I = amplitude * amplitude * Math.pow(Math.cos(phase), 2) * Math.pow(envelope, 2);
  return Math.min(1, Math.max(0, I));
}

// ─── Wave Field Rendering ─────────────────────────────────────────────────────
/**
 * Renders the 2D wave propagation field using per-pixel superposition of
 * two sinusoidal point sources (Huygens principle), animated by state.phase.
 * Slit 1 = cyan, Slit 2 = orange. Constructive → bright mix, destructive → dark.
 */
function drawWaveField() {
  const W = waveCanvas.width;
  const H = waveCanvas.height;
  if (W <= 0 || H <= 0) return;

  const imageData = wCtx.createImageData(W, H);
  const data = imageData.data;

  // ── Layout geometry ──────────────────────────────────────────────────────
  const BARRIER_X = Math.floor(W * 0.14);
  const cx = BARRIER_X;
  const cy = H / 2;

  const physH  = state.L * 0.8;
  const scaleX = state.L / (W - cx);
  const scaleY = physH / H;

  const slitOffPx  = (state.d / 2) / scaleY;
  const slit1y     = cy - slitOffPx;   // top slit centre (pixels)
  const slit2y     = cy + slitOffPx;   // bottom slit centre (pixels)
  const slitHalfPx = Math.max(2, (state.a / 2) / scaleY);

  const phase = state.phase;
  const amp   = state.amplitude;

  // Visual ring spacing: fixed at a comfortable 20 px regardless of λ,
  // but modulated slightly so wavelength slider has a visible effect.
  const lambdaNm    = state.lambda * 1e9;
  const visLambdaPx = 16 + (lambdaNm - 380) / (750 - 380) * 12;  // 16–28 px
  const kVis        = (2 * Math.PI) / visLambdaPx;

  // ── Slit colors (always fixed, independent of wavelength) ────────────────
  // Slit 1 = cyan  [0, 210, 255]
  // Slit 2 = orange [255, 140, 30]
  // Where both crests coincide → channels add → near-white (constructive)
  // Where one is crest and other trough → partial cancellation → dim color
  // Where both troughs → black (destructive minimum)
  const S1R = 0,   S1G = 210, S1B = 255;   // cyan
  const S2R = 255, S2G = 130, S2B = 20;    // orange

  // ── Per-pixel loop ────────────────────────────────────────────────────────
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const idx = (py * W + px) * 4;

      // Left of barrier: dark + animated plane-wave stripes
      if (px < cx) {
        const planePhi = kVis * px - phase;
        const stripe   = 0.5 * (Math.cos(planePhi) + 1);  // 0→1
        const b        = Math.round(Math.pow(stripe, 1.4) * 55);
        data[idx    ] = b;
        data[idx + 1] = b;
        data[idx + 2] = b + 8;
        data[idx + 3] = 255;
        continue;
      }

      // Distance from each slit (display pixels)
      const dx  = px - cx;
      const dy1 = py - slit1y;
      const dy2 = py - slit2y;
      const r1  = Math.sqrt(dx * dx + dy1 * dy1) + 1e-9;
      const r2  = Math.sqrt(dx * dx + dy2 * dy2) + 1e-9;

      // Per-slit wave value: cos wave × 1/√r amplitude decay
      const decay1 = amp / Math.sqrt(Math.max(r1, 3));
      const decay2 = amp / Math.sqrt(Math.max(r2, 3));
      const w1 = Math.cos(kVis * r1 - phase) * decay1;  // −decay1 → +decay1
      const w2 = Math.cos(kVis * r2 - phase) * decay2;

      // Map each wave [-decay, +decay] → brightness [0, 1]
      // crest = 1, trough = 0 (so black background at troughs)
      const b1 = Math.max(0, w1 / (decay1 + 1e-9));   // 0 → 1, only positive part lights up
      const b2 = Math.max(0, w2 / (decay2 + 1e-9));

      // Sharpen rings: raise to power so rings are crisp lines, not fuzzy bands
      const ring1 = Math.pow(b1, 1.8);
      const ring2 = Math.pow(b2, 1.8);

      // Add a soft glow proportional to the combined constructive amplitude
      // (makes the interference corridors glow even between ring lines)
      const combined   = w1 + w2;
      const normC      = combined / (decay1 + decay2 + 1e-9);  // −1 → +1
      const glowBright = Math.max(0, normC);                   // only constructive half
      const glow       = Math.pow(glowBright, 2.5) * 0.35;    // subtle

      // Final per-channel: slit1 color × ring1 + slit2 color × ring2 + white glow
      let R = S1R * ring1 + S2R * ring2 + 255 * glow;
      let G = S1G * ring1 + S2G * ring2 + 255 * glow;
      let B = S1B * ring1 + S2B * ring2 + 255 * glow;

      // Clamp to 0–255
      data[idx    ] = Math.min(255, Math.round(R));
      data[idx + 1] = Math.min(255, Math.round(G));
      data[idx + 2] = Math.min(255, Math.round(B));
      data[idx + 3] = 255;
    }
  }

  wCtx.putImageData(imageData, 0, 0);

  // ── Barrier ───────────────────────────────────────────────────────────────
  const slitHalfPxClamped = Math.max(2, slitHalfPx);
  const barrierW = 10;
  const bx = BARRIER_X - barrierW / 2;

  // Fill segments
  wCtx.fillStyle = '#1c2333';
  wCtx.fillRect(bx, 0,                        barrierW, slit1y - slitHalfPxClamped);
  wCtx.fillRect(bx, slit1y + slitHalfPxClamped, barrierW, slit2y - slitHalfPxClamped - (slit1y + slitHalfPxClamped));
  wCtx.fillRect(bx, slit2y + slitHalfPxClamped, barrierW, H - (slit2y + slitHalfPxClamped));

  // Bright edge lines
  wCtx.strokeStyle = '#4a6fa5';
  wCtx.lineWidth = 1.5;
  [[0, slit1y - slitHalfPxClamped],
   [slit1y + slitHalfPxClamped, slit2y - slitHalfPxClamped - (slit1y + slitHalfPxClamped)],
   [slit2y + slitHalfPxClamped, H - (slit2y + slitHalfPxClamped)]
  ].forEach(([y, h]) => { if (h > 0) wCtx.strokeRect(bx, y, barrierW, h); });

  // Slit gap highlight — thin bright lines showing the actual opening
  wCtx.strokeStyle = '#ffffff44';
  wCtx.lineWidth = 1;
  // Top slit edges
  wCtx.beginPath();
  wCtx.moveTo(bx, slit1y - slitHalfPxClamped);
  wCtx.lineTo(bx + barrierW, slit1y - slitHalfPxClamped);
  wCtx.moveTo(bx, slit1y + slitHalfPxClamped);
  wCtx.lineTo(bx + barrierW, slit1y + slitHalfPxClamped);
  // Bottom slit edges
  wCtx.moveTo(bx, slit2y - slitHalfPxClamped);
  wCtx.lineTo(bx + barrierW, slit2y - slitHalfPxClamped);
  wCtx.moveTo(bx, slit2y + slitHalfPxClamped);
  wCtx.lineTo(bx + barrierW, slit2y + slitHalfPxClamped);
  wCtx.stroke();

  // ── Slit glow halos ───────────────────────────────────────────────────────
  // Each slit gets a radial glow in its own color to clearly mark the source.
  const drawSlitHalo = (sy, r, g, b) => {
    const grad = wCtx.createRadialGradient(cx, sy, 0, cx, sy, slitHalfPxClamped * 5 + 12);
    grad.addColorStop(0,   `rgba(${r},${g},${b},0.9)`);
    grad.addColorStop(0.3, `rgba(${r},${g},${b},0.4)`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    wCtx.save();
    // Clip to a small region around the slit so glow doesn't bleed everywhere
    wCtx.beginPath();
    wCtx.rect(cx - 4, sy - slitHalfPxClamped * 5 - 12, 28, slitHalfPxClamped * 10 + 24);
    wCtx.clip();
    wCtx.fillStyle = grad;
    wCtx.fillRect(cx - 4, sy - slitHalfPxClamped * 5 - 12, 28, slitHalfPxClamped * 10 + 24);
    wCtx.restore();
  };
  drawSlitHalo(slit1y, S1R, S1G, S1B);
  drawSlitHalo(slit2y, S2R, S2G, S2B);

  // ── Slit dot markers ─────────────────────────────────────────────────────
  [[slit1y, S1R, S1G, S1B, 'SLIT 1'],
   [slit2y, S2R, S2G, S2B, 'SLIT 2']
  ].forEach(([sy, r, g, b, label]) => {
    // Outer ring
    wCtx.beginPath();
    wCtx.arc(cx, sy, slitHalfPxClamped + 4, 0, 2 * Math.PI);
    wCtx.strokeStyle = `rgba(${r},${g},${b},0.8)`;
    wCtx.lineWidth = 2;
    wCtx.stroke();
    // Inner fill
    wCtx.beginPath();
    wCtx.arc(cx, sy, slitHalfPxClamped + 1, 0, 2 * Math.PI);
    wCtx.fillStyle = `rgba(${r},${g},${b},0.5)`;
    wCtx.fill();
  });

  // ── Slit labels ───────────────────────────────────────────────────────────
  wCtx.save();
  wCtx.font = 'bold 10px monospace';
  wCtx.textAlign = 'right';
  // Slit 1 label (cyan)
  wCtx.fillStyle = `rgba(${S1R},${S1G},${S1B},1)`;
  wCtx.fillText('SLIT 1', bx - 4, slit1y + 4);
  // Slit 2 label (orange)
  wCtx.fillStyle = `rgba(${S2R},${S2G},${S2B},1)`;
  wCtx.fillText('SLIT 2', bx - 4, slit2y + 4);
  wCtx.restore();

  // ── Barrier label ─────────────────────────────────────────────────────────
  wCtx.save();
  wCtx.font = 'bold 8px monospace';
  wCtx.fillStyle = '#6a7f9a';
  wCtx.textAlign = 'center';
  wCtx.fillText('BARRIER', BARRIER_X, 10);
  wCtx.restore();

  // ── Source / gun region ───────────────────────────────────────────────────
  const gunW = 18, gunH = 36;
  const gunX = 2,  gunY = cy - gunH / 2;
  wCtx.fillStyle   = '#2a3a50';
  wCtx.strokeStyle = '#58a6ff';
  wCtx.lineWidth   = 1.5;
  wCtx.beginPath();
  wCtx.roundRect(gunX, gunY, gunW, gunH, 3);
  wCtx.fill();
  wCtx.stroke();
  // Nozzle
  wCtx.fillStyle = '#3d5a80';
  wCtx.fillRect(gunX + gunW, cy - 4, 5, 8);
  wCtx.strokeStyle = '#58a6ff';
  wCtx.lineWidth = 1;
  wCtx.strokeRect(gunX + gunW, cy - 4, 5, 8);
  // Lens dot
  wCtx.beginPath();
  wCtx.arc(gunX + gunW / 2, cy, 4, 0, 2 * Math.PI);
  wCtx.fillStyle = '#ffffff';
  wCtx.globalAlpha = 0.85;
  wCtx.fill();
  wCtx.globalAlpha = 1;
  // Label
  wCtx.save();
  wCtx.font = 'bold 8px monospace';
  wCtx.fillStyle = '#58a6ffcc';
  wCtx.textAlign = 'center';
  wCtx.fillText('SOURCE', gunX + gunW / 2 + 2, gunY - 6);
  // Dashed arrow
  wCtx.strokeStyle = 'rgba(255,255,255,0.25)';
  wCtx.lineWidth = 1;
  wCtx.setLineDash([3, 4]);
  wCtx.beginPath();
  wCtx.moveTo(gunX + gunW + 6, cy);
  wCtx.lineTo(bx - 4, cy);
  wCtx.stroke();
  wCtx.setLineDash([]);
  wCtx.restore();

  // ── Screen strip ──────────────────────────────────────────────────────────
  const [wr, wg, wb] = wavelengthToRGB(lambdaNm);
  const screenW      = 18;
  const screenStartX = W - screenW - 1;
  const screenImg    = wCtx.createImageData(screenW, H);
  const sd           = screenImg.data;
  for (let sy = 0; sy < H; sy++) {
    const y_phys = (sy - cy) * scaleY;
    const I      = intensity(y_phys, state.lambda, state.d, state.a, state.L, state.amplitude);
    for (let sx = 0; sx < screenW; sx++) {
      const si = (sy * screenW + sx) * 4;
      sd[si    ] = Math.round(wr * I);
      sd[si + 1] = Math.round(wg * I);
      sd[si + 2] = Math.round(wb * I);
      sd[si + 3] = 255;
    }
  }
  wCtx.putImageData(screenImg, screenStartX, 0);

  // Screen border
  wCtx.strokeStyle = '#58a6ff';
  wCtx.lineWidth   = 1.5;
  wCtx.strokeRect(screenStartX, 0, screenW, H);
  wCtx.strokeStyle = '#58a6ff88';
  wCtx.lineWidth   = 3;
  wCtx.beginPath();
  wCtx.moveTo(screenStartX, 0);
  wCtx.lineTo(screenStartX, H);
  wCtx.stroke();

  // Detector label
  wCtx.save();
  wCtx.font = 'bold 8px monospace';
  wCtx.fillStyle = '#58a6ffcc';
  wCtx.textAlign = 'center';
  wCtx.translate(W - 5, H / 2);
  wCtx.rotate(-Math.PI / 2);
  wCtx.fillText('DETECTOR SCREEN', 0, 0);
  wCtx.restore();

  // ── Fringe order labels ───────────────────────────────────────────────────
  if (state.showLabels) {
    wCtx.save();
    wCtx.font = '10px monospace';
    wCtx.textAlign = 'left';
    const maxOrder = 3;
    for (let m = -maxOrder; m <= maxOrder; m++) {
      const y_m  = m * state.lambda * state.L / state.d;
      const py_m = cy + y_m / scaleY;
      if (py_m >= 4 && py_m <= H - 4) {
        wCtx.fillStyle = m === 0 ? '#f0c040cc' : '#f0c04099';
        wCtx.fillText(`m=${m > 0 ? '+' : ''}${m}`, screenStartX + screenW + 2, py_m + 3);
      }
    }
    wCtx.restore();
  }
}

// ─── Intensity Graph ──────────────────────────────────────────────────────────
function drawIntensityGraph() {
  const W = graphCanvas.width;
  const H = graphCanvas.height;
  if (W <= 0 || H <= 0) return;

  gCtx.clearRect(0, 0, W, H);

  // Background
  gCtx.fillStyle = '#050810';
  gCtx.fillRect(0, 0, W, H);

  const PAD_L = 40, PAD_R = 16, PAD_T = 12, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  // ── Axes ──
  gCtx.strokeStyle = '#30363d';
  gCtx.lineWidth = 1;
  gCtx.beginPath();
  gCtx.moveTo(PAD_L, PAD_T);
  gCtx.lineTo(PAD_L, PAD_T + plotH);
  gCtx.lineTo(PAD_L + plotW, PAD_T + plotH);
  gCtx.stroke();

  // Zero line
  gCtx.strokeStyle = '#30363d88';
  gCtx.setLineDash([3, 4]);
  gCtx.beginPath();
  gCtx.moveTo(PAD_L, PAD_T + plotH / 2);
  gCtx.lineTo(PAD_L + plotW, PAD_T + plotH / 2);
  gCtx.stroke();
  gCtx.setLineDash([]);

  // ── Axis labels ──
  gCtx.fillStyle = '#8b949e';
  gCtx.font = '10px monospace';
  gCtx.textAlign = 'center';
  gCtx.fillText('Screen position y', PAD_L + plotW / 2, H - 4);
  gCtx.save();
  gCtx.translate(10, PAD_T + plotH / 2);
  gCtx.rotate(-Math.PI / 2);
  gCtx.fillText('Intensity', 0, 0);
  gCtx.restore();

  // ── Physical range: show ±4 fringe spacings ──
  const beta = state.lambda * state.L / state.d;  // fringe spacing (m)
  const yRange = Math.max(beta * 5, 1e-4);         // metres on screen
  const physToPlotY = (y) => PAD_T + plotH / 2 - (y / yRange) * (plotH / 2);

  // Tick marks
  gCtx.fillStyle = '#8b949e';
  gCtx.font = '9px monospace';
  gCtx.textAlign = 'right';
  for (let m = -4; m <= 4; m++) {
    const y_m = m * beta;
    const py = physToPlotY(y_m);
    if (py >= PAD_T && py <= PAD_T + plotH) {
      gCtx.strokeStyle = '#30363d66';
      gCtx.beginPath();
      gCtx.moveTo(PAD_L - 3, py);
      gCtx.lineTo(PAD_L, py);
      gCtx.stroke();
      if (m !== 0) gCtx.fillText(`${(y_m * 1000).toFixed(1)}`, PAD_L - 5, py + 3);
    }
  }
  gCtx.textAlign = 'center';
  gCtx.fillText('0', PAD_L - 5, physToPlotY(0) + 3);

  // ── Fill under curve ──
  const [wr, wg, wb] = wavelengthToRGB(state.lambda * 1e9);
  const nSamples = plotW;
  const yStep = (2 * yRange) / nSamples;

  // Create gradient fill
  const grad = gCtx.createLinearGradient(PAD_L, PAD_T, PAD_L + plotW, PAD_T);
  grad.addColorStop(0, `rgba(${wr},${wg},${wb},0.08)`);
  grad.addColorStop(0.5, `rgba(${wr},${wg},${wb},0.25)`);
  grad.addColorStop(1, `rgba(${wr},${wg},${wb},0.08)`);

  // Draw filled area
  gCtx.beginPath();
  let first = true;
  for (let i = 0; i <= nSamples; i++) {
    const y_phys = -yRange + i * yStep;
    const I      = intensity(y_phys, state.lambda, state.d, state.a, state.L, state.amplitude);
    const px     = PAD_L + i;
    const py     = PAD_T + plotH - I * plotH;
    if (first) { gCtx.moveTo(px, PAD_T + plotH); gCtx.lineTo(px, py); first = false; }
    else gCtx.lineTo(px, py);
  }
  gCtx.lineTo(PAD_L + nSamples, PAD_T + plotH);
  gCtx.closePath();
  gCtx.fillStyle = grad;
  gCtx.fill();

  // Draw curve line
  gCtx.beginPath();
  first = true;
  for (let i = 0; i <= nSamples; i++) {
    const y_phys = -yRange + i * yStep;
    const I      = intensity(y_phys, state.lambda, state.d, state.a, state.L, state.amplitude);
    const px     = PAD_L + i;
    const py     = PAD_T + plotH - I * plotH;
    if (first) { gCtx.moveTo(px, py); first = false; }
    else gCtx.lineTo(px, py);
  }
  gCtx.strokeStyle = `rgb(${wr},${wg},${wb})`;
  gCtx.lineWidth = 1.5;
  gCtx.stroke();

  // ── Fringe markers ──
  if (state.showLabels) {
    gCtx.font = '9px monospace';
    for (let m = -4; m <= 4; m++) {
      const y_m = m * beta;
      const px_m = PAD_L + Math.round((y_m + yRange) / (2 * yRange) * plotW);
      if (px_m >= PAD_L && px_m <= PAD_L + plotW) {
        gCtx.strokeStyle = m === 0 ? '#f0c04088' : '#f0c04044';
        gCtx.setLineDash([2, 3]);
        gCtx.beginPath();
        gCtx.moveTo(px_m, PAD_T);
        gCtx.lineTo(px_m, PAD_T + plotH);
        gCtx.stroke();
        gCtx.setLineDash([]);
        gCtx.fillStyle = m === 0 ? '#f0c040cc' : '#f0c04099';
        gCtx.textAlign = 'center';
        gCtx.fillText(`m=${m > 0 ? '+' : ''}${m}`, px_m, PAD_T + 9);
      }
    }
  }
}

// ─── Formula Panel Updates ────────────────────────────────────────────────────
function updateFormulaPanel() {
  const { lambda, d, a, L } = state;
  const beta = lambda * L / d;

  document.getElementById('delta-val').textContent =
    `Δ ≈ ${(d * 0).toFixed(1)} nm (at θ=0)`;
  document.getElementById('fringe-spacing-val').textContent =
    `β = ${(beta * 1000).toFixed(3)} mm`;

  document.getElementById('p-lambda').textContent = `${(lambda * 1e9).toFixed(0)} nm`;
  document.getElementById('p-d').textContent      = `${(d * 1000).toFixed(2)} mm`;
  document.getElementById('p-a').textContent      = `${(a * 1000).toFixed(3)} mm`;
  document.getElementById('p-L').textContent      = `${L.toFixed(1)} m`;

  // Fringe table
  const table = document.getElementById('fringe-table');
  table.innerHTML = '';
  for (let m = -3; m <= 3; m++) {
    const y_m = m * lambda * L / d;
    const tr = document.createElement('tr');
    tr.className = 'maxima';
    tr.innerHTML = `<td>m=${m > 0 ? '+' : ''}${m}</td><td>${(y_m * 1000).toFixed(3)} mm</td>`;
    table.appendChild(tr);
  }
}

// ─── Controls Wiring ──────────────────────────────────────────────────────────
function wireControls() {
  const bind = (id, key, format, scale = 1) => {
    const el = document.getElementById(id);
    const valEl = document.getElementById(`${id}-val`);
    el.addEventListener('input', () => {
      state[key] = parseFloat(el.value) * scale;
      if (valEl) valEl.textContent = format(parseFloat(el.value));
      updateFormulaPanel();
    });
  };

  bind('wavelength',  'lambda',    v => `${v} nm`,          1e-9);
  bind('slit-sep',    'd',         v => `${(+v).toFixed(1)} mm`, 1e-3);
  bind('slit-width',  'a',         v => `${(+v).toFixed(2)} mm`, 1e-3);
  bind('screen-dist', 'L',         v => `${(+v).toFixed(1)} m`,  1);
  bind('intensity',   'amplitude', v => `${(+v).toFixed(1)}`,     1);
  bind('anim-speed',  'animSpeed', v => `${(+v).toFixed(1)}×`,    1);

  document.getElementById('toggle-anim').addEventListener('change', e => {
    state.animate = e.target.checked;
  });
  document.getElementById('toggle-labels').addEventListener('change', e => {
    state.showLabels = e.target.checked;
  });
}

// ─── Animation Loop ───────────────────────────────────────────────────────────
let lastTime = 0;
function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // seconds, capped
  lastTime = timestamp;

  if (state.animate) {
    // Advance phase: wave frequency ~2e14 Hz, scaled down for visibility
    state.phase += dt * state.animSpeed * 4.0;
  }

  drawWaveField();
  drawIntensityGraph();

  requestAnimationFrame(loop);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  resizeCanvases();
  wireControls();
  updateFormulaPanel();

  // Set initial slider positions and value displays
  const sliders = [
    ['wavelength',  550,  v => `${v} nm`],
    ['slit-sep',    1.0,  v => `${(+v).toFixed(1)} mm`],
    ['slit-width',  0.10, v => `${(+v).toFixed(2)} mm`],
    ['screen-dist', 1.0,  v => `${(+v).toFixed(1)} m`],
    ['intensity',   1.0,  v => `${(+v).toFixed(1)}`],
    ['anim-speed',  1.0,  v => `${(+v).toFixed(1)}×`],
  ];
  sliders.forEach(([id, , fmt]) => {
    const el    = document.getElementById(id);
    const valEl = document.getElementById(`${id}-val`);
    if (valEl) valEl.textContent = fmt(el.value);
  });

  requestAnimationFrame(loop);
}

window.addEventListener('load', init);
