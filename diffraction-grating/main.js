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
  lambda:     550e-9,
  N:          6,
  d:          1.0e-3,
  a:          0.20e-3,
  L:          1.0,
  amplitude:  1.0,
  animSpeed:  1.0,
  animate:    true,
  showLabels: true,
  phase:      0,
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

function sinc(x) {
  if (Math.abs(x) < 1e-10) return 1;
  const px = Math.PI * x;
  return Math.sin(px) / px;
}

/**
 * N-slit grating intensity at screen position y.
 * I = A² · sinc²(πa sinθ/λ) · [sin(Nπd sinθ/λ) / (N sin(πd sinθ/λ))]²
 */
function intensity(y) {
  const { lambda, N, d, a, L, amplitude } = state;
  const sinTheta = y / Math.sqrt(y*y + L*L);
  // Single-slit envelope
  const beta   = a * sinTheta / lambda;
  const env    = sinc(beta);
  // N-slit interference factor
  const delta  = Math.PI * d * sinTheta / lambda;
  let grating;
  if (Math.abs(Math.sin(delta)) < 1e-10) {
    // At principal maxima: sin(Nδ)/sin(δ) → N
    grating = 1.0;
  } else {
    grating = Math.sin(N * delta) / (N * Math.sin(delta));
  }
  const I = amplitude * amplitude * env * env * grating * grating;
  return Math.min(1, Math.max(0, I));
}

// ─── Wave Field Rendering ─────────────────────────────────────────────────────
function drawWaveField() {
  const W = waveCanvas.width;
  const H = waveCanvas.height;
  if (W <= 0 || H <= 0) return;

  const imageData = wCtx.createImageData(W, H);
  const data = imageData.data;

  const BARRIER_X = Math.floor(W * 0.14);
  const cx = BARRIER_X;
  const cy = H / 2;

  const L_MAX    = 2.0;
  const SCREEN_W = 18;
  const availPx  = W - cx - SCREEN_W - 2;
  const screenStartX = Math.round(cx + availPx * (state.L / L_MAX));

  const physH  = state.L * 0.8;
  const scaleY = physH / H;

  // Slit positions (centred at cy)
  const N = state.N;
  const slitSpacingPx = state.d / scaleY;
  const slitHalfPx    = Math.max(1.5, (state.a / 2) / scaleY);
  const totalSpan     = (N - 1) * slitSpacingPx;
  const topSlitY      = cy - totalSpan / 2;

  const slitCenters = [];
  for (let i = 0; i < N; i++) slitCenters.push(topSlitY + i * slitSpacingPx);

  const phase = state.phase;
  const amp   = state.amplitude;
  const lambdaNm    = state.lambda * 1e9;
  const visLambdaPx = 16 + (lambdaNm - 380) / (750 - 380) * 12;
  const kVis        = (2 * Math.PI) / visLambdaPx;
  const SR = 0, SG = 210, SB = 255;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const idx = (py * W + px) * 4;

      if (px < cx) {
        const planePhi = kVis * px - phase;
        const stripe   = 0.5 * (Math.cos(planePhi) + 1);
        const b = Math.round(Math.pow(stripe, 1.4) * 55);
        data[idx] = b; data[idx+1] = b; data[idx+2] = b+8; data[idx+3] = 255;
        continue;
      }
      if (px >= screenStartX) {
        data[idx] = 5; data[idx+1] = 8; data[idx+2] = 12; data[idx+3] = 255;
        continue;
      }

      // Sum waves from all N slits
      let wSum = 0, ampSum = 0;
      for (const sy of slitCenters) {
        const dx = px - cx;
        const dy = py - sy;
        const r  = Math.sqrt(dx*dx + dy*dy) + 1e-9;
        const decay = amp / Math.sqrt(Math.max(r, 3));
        wSum   += Math.cos(kVis * r - phase) * decay;
        ampSum += decay;
      }
      wSum   /= N;
      ampSum /= N;

      const b1   = Math.max(0, wSum / (ampSum + 1e-9));
      const ring = Math.pow(b1, 1.8);
      const normC = wSum / (ampSum + 1e-9);
      const glow  = Math.pow(Math.max(0, normC), 2.5) * 0.4;

      let R = SR * ring + 255 * glow;
      let G = SG * ring + 255 * glow;
      let B = SB * ring + 255 * glow;

      data[idx]   = Math.min(255, Math.round(R));
      data[idx+1] = Math.min(255, Math.round(G));
      data[idx+2] = Math.min(255, Math.round(B));
      data[idx+3] = 255;
    }
  }
  wCtx.putImageData(imageData, 0, 0);

  // ── Barrier ──
  const barrierW = 10;
  const bx = BARRIER_X - barrierW / 2;
  wCtx.fillStyle = '#1c2333';

  // Draw barrier blocks between/around slits
  const drawBlock = (y1, y2) => {
    const h = y2 - y1;
    if (h > 0) { wCtx.fillRect(bx, y1, barrierW, h); wCtx.strokeStyle = '#4a6fa5'; wCtx.lineWidth = 1.5; wCtx.strokeRect(bx, y1, barrierW, h); }
  };
  drawBlock(0, slitCenters[0] - slitHalfPx);
  for (let i = 0; i < N - 1; i++) drawBlock(slitCenters[i] + slitHalfPx, slitCenters[i+1] - slitHalfPx);
  drawBlock(slitCenters[N-1] + slitHalfPx, H);

  // Barrier label
  wCtx.save(); wCtx.font = 'bold 8px monospace'; wCtx.fillStyle = '#6a7f9a';
  wCtx.textAlign = 'center'; wCtx.fillText('GRATING', BARRIER_X, 10); wCtx.restore();

  // Source gun
  const gunW = 18, gunH = 36, gunX = 2, gunY = cy - gunH / 2;
  wCtx.fillStyle = '#2a3a50'; wCtx.strokeStyle = '#58a6ff'; wCtx.lineWidth = 1.5;
  wCtx.beginPath(); wCtx.roundRect(gunX, gunY, gunW, gunH, 3); wCtx.fill(); wCtx.stroke();
  wCtx.fillStyle = '#3d5a80'; wCtx.fillRect(gunX + gunW, cy - 4, 5, 8);
  wCtx.strokeStyle = '#58a6ff'; wCtx.lineWidth = 1; wCtx.strokeRect(gunX + gunW, cy - 4, 5, 8);
  wCtx.beginPath(); wCtx.arc(gunX + gunW / 2, cy, 4, 0, 2 * Math.PI);
  wCtx.fillStyle = '#ffffff'; wCtx.globalAlpha = 0.85; wCtx.fill(); wCtx.globalAlpha = 1;
  wCtx.save(); wCtx.font = 'bold 8px monospace'; wCtx.fillStyle = '#58a6ffcc'; wCtx.textAlign = 'center';
  wCtx.fillText('SOURCE', gunX + gunW / 2 + 2, gunY - 6);
  wCtx.strokeStyle = 'rgba(255,255,255,0.25)'; wCtx.lineWidth = 1; wCtx.setLineDash([3,4]);
  wCtx.beginPath(); wCtx.moveTo(gunX + gunW + 6, cy); wCtx.lineTo(bx - 4, cy); wCtx.stroke();
  wCtx.setLineDash([]); wCtx.restore();

  // Screen strip
  const [wr, wg, wb] = wavelengthToRGB(lambdaNm);
  const screenImg = wCtx.createImageData(SCREEN_W, H);
  const sd = screenImg.data;
  for (let sy = 0; sy < H; sy++) {
    const y_phys = (sy - cy) * scaleY;
    const I = intensity(y_phys);
    for (let sx = 0; sx < SCREEN_W; sx++) {
      const si = (sy * SCREEN_W + sx) * 4;
      sd[si] = Math.round(wr*I); sd[si+1] = Math.round(wg*I); sd[si+2] = Math.round(wb*I); sd[si+3] = 255;
    }
  }
  wCtx.putImageData(screenImg, screenStartX, 0);
  wCtx.strokeStyle = '#58a6ff'; wCtx.lineWidth = 1.5; wCtx.strokeRect(screenStartX, 0, SCREEN_W, H);
  wCtx.save(); wCtx.font = 'bold 8px monospace'; wCtx.fillStyle = '#58a6ffcc'; wCtx.textAlign = 'center';
  wCtx.translate(screenStartX + SCREEN_W / 2, H / 2); wCtx.rotate(-Math.PI / 2);
  wCtx.fillText('DETECTOR SCREEN', 0, 0); wCtx.restore();

  // Distance annotation
  const annotY = H - 14;
  wCtx.save(); wCtx.strokeStyle = 'rgba(255,255,255,0.22)'; wCtx.lineWidth = 1; wCtx.setLineDash([4,5]);
  wCtx.beginPath(); wCtx.moveTo(cx, annotY); wCtx.lineTo(screenStartX, annotY); wCtx.stroke();
  wCtx.setLineDash([]);
  [[cx,1],[screenStartX,-1]].forEach(([x,dir]) => {
    wCtx.strokeStyle = 'rgba(255,255,255,0.35)'; wCtx.lineWidth = 1;
    wCtx.beginPath(); wCtx.moveTo(x,annotY); wCtx.lineTo(x+dir*5,annotY-3);
    wCtx.moveTo(x,annotY); wCtx.lineTo(x+dir*5,annotY+3); wCtx.stroke();
  });
  wCtx.font = 'bold 9px monospace'; wCtx.fillStyle = 'rgba(255,255,255,0.55)'; wCtx.textAlign = 'center';
  wCtx.fillText(`L = ${state.L.toFixed(1)} m`, cx + (screenStartX-cx)/2, annotY - 4);
  wCtx.restore();

  // Order labels
  if (state.showLabels) {
    wCtx.save(); wCtx.font = '10px monospace'; wCtx.textAlign = 'left';
    for (let m = -4; m <= 4; m++) {
      const sinT = m * state.lambda / state.d;
      if (Math.abs(sinT) >= 1) continue;
      const y_m  = sinT * state.L / Math.sqrt(1 - sinT*sinT);  // exact
      const py_m = cy + y_m / scaleY;
      if (py_m >= 4 && py_m <= H - 4) {
        const labelX = screenStartX + SCREEN_W + 2;
        if (labelX + 30 <= W) {
          wCtx.fillStyle = m === 0 ? '#f0c040cc' : '#f0c04099';
          wCtx.fillText(`m=${m>0?'+':''}${m}`, labelX, py_m + 3);
        }
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
  gCtx.fillStyle = '#050810'; gCtx.fillRect(0, 0, W, H);

  const PAD_L = 40, PAD_R = 16, PAD_T = 12, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  gCtx.strokeStyle = '#30363d'; gCtx.lineWidth = 1;
  gCtx.beginPath(); gCtx.moveTo(PAD_L, PAD_T); gCtx.lineTo(PAD_L, PAD_T + plotH);
  gCtx.lineTo(PAD_L + plotW, PAD_T + plotH); gCtx.stroke();

  gCtx.fillStyle = '#8b949e'; gCtx.font = '10px monospace'; gCtx.textAlign = 'center';
  gCtx.fillText('Screen position y', PAD_L + plotW / 2, H - 4);
  gCtx.save(); gCtx.translate(10, PAD_T + plotH / 2); gCtx.rotate(-Math.PI / 2);
  gCtx.fillText('Intensity', 0, 0); gCtx.restore();

  // Range: ±3 grating orders or ±5 fringe spacings if m=1 off screen
  const beta1 = state.lambda / state.d;
  const yRange = Math.min(3 * beta1 * state.L, 0.05);
  const nSamples = plotW;
  const yStep = (2 * yRange) / nSamples;
  const [wr, wg, wb] = wavelengthToRGB(state.lambda * 1e9);

  const grad = gCtx.createLinearGradient(PAD_L, PAD_T, PAD_L + plotW, PAD_T);
  grad.addColorStop(0,   `rgba(${wr},${wg},${wb},0.06)`);
  grad.addColorStop(0.5, `rgba(${wr},${wg},${wb},0.28)`);
  grad.addColorStop(1,   `rgba(${wr},${wg},${wb},0.06)`);

  gCtx.beginPath();
  let first = true;
  for (let i = 0; i <= nSamples; i++) {
    const y_phys = -yRange + i * yStep;
    const I  = intensity(y_phys);
    const px = PAD_L + i;
    const py = PAD_T + plotH - I * plotH;
    if (first) { gCtx.moveTo(px, PAD_T + plotH); gCtx.lineTo(px, py); first = false; }
    else gCtx.lineTo(px, py);
  }
  gCtx.lineTo(PAD_L + nSamples, PAD_T + plotH); gCtx.closePath();
  gCtx.fillStyle = grad; gCtx.fill();

  gCtx.beginPath(); first = true;
  for (let i = 0; i <= nSamples; i++) {
    const y_phys = -yRange + i * yStep;
    const I  = intensity(y_phys);
    const px = PAD_L + i;
    const py = PAD_T + plotH - I * plotH;
    if (first) { gCtx.moveTo(px, py); first = false; } else gCtx.lineTo(px, py);
  }
  gCtx.strokeStyle = `rgb(${wr},${wg},${wb})`; gCtx.lineWidth = 1.5; gCtx.stroke();

  // Principal maxima markers
  if (state.showLabels) {
    gCtx.font = '9px monospace';
    for (let m = -3; m <= 3; m++) {
      const sinT = m * state.lambda / state.d;
      if (Math.abs(sinT) >= 1) continue;
      const y_m  = sinT * state.L / Math.sqrt(1 - sinT*sinT);
      const px_m = PAD_L + Math.round((y_m + yRange) / (2 * yRange) * plotW);
      if (px_m >= PAD_L && px_m <= PAD_L + plotW) {
        gCtx.strokeStyle = m === 0 ? '#f0c04088' : '#f0c04044';
        gCtx.setLineDash([2,3]);
        gCtx.beginPath(); gCtx.moveTo(px_m, PAD_T); gCtx.lineTo(px_m, PAD_T + plotH); gCtx.stroke();
        gCtx.setLineDash([]);
        gCtx.fillStyle = m === 0 ? '#f0c040cc' : '#f0c04099';
        gCtx.textAlign = 'center';
        gCtx.fillText(`m=${m>0?'+':''}${m}`, px_m, PAD_T + 9);
      }
    }
  }
}

// ─── Formula Panel Updates ─────────────────────────────────────────────────────
function updateFormulaPanel() {
  const { lambda, N, d, a, L } = state;
  document.getElementById('resolving-power-val').textContent = `R = mN = N = ${N} (m=1)`;
  document.getElementById('p-lambda').textContent = `${(lambda*1e9).toFixed(0)} nm`;
  document.getElementById('p-N').textContent      = `${N}`;
  document.getElementById('p-d').textContent      = `${(d*1000).toFixed(2)} mm`;
  document.getElementById('p-a').textContent      = `${(a*1000).toFixed(3)} mm`;
  document.getElementById('p-L').textContent      = `${L.toFixed(1)} m`;

  const table = document.getElementById('peaks-table');
  table.innerHTML = '';
  for (let m = -4; m <= 4; m++) {
    const sinT = m * lambda / d;
    if (Math.abs(sinT) >= 1) continue;
    const y_m = sinT * L / Math.sqrt(1 - sinT*sinT);
    const tr = document.createElement('tr');
    tr.className = 'maxima';
    tr.innerHTML = `<td>m=${m>0?'+':''}${m}</td><td>${(y_m*1000).toFixed(2)} mm</td>`;
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
  bind('wavelength',  'lambda',    v => `${v} nm`,             1e-9);
  bind('num-slits',   'N',         v => `${parseInt(v)}`,      1);
  bind('slit-sep',    'd',         v => `${(+v).toFixed(1)} mm`, 1e-3);
  bind('slit-width',  'a',         v => `${(+v).toFixed(2)} mm`, 1e-3);
  bind('screen-dist', 'L',         v => `${(+v).toFixed(1)} m`,  1);
  bind('amplitude',   'amplitude', v => `${(+v).toFixed(1)}`,    1);
  bind('anim-speed',  'animSpeed', v => `${(+v).toFixed(1)}×`,   1);

  document.getElementById('toggle-anim').addEventListener('change', e => { state.animate = e.target.checked; });
  document.getElementById('toggle-labels').addEventListener('change', e => { state.showLabels = e.target.checked; });
}

// ─── Animation Loop ───────────────────────────────────────────────────────────
let lastTime = 0;
function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  if (state.animate) state.phase += dt * state.animSpeed * 4.0;
  drawWaveField();
  drawIntensityGraph();
  requestAnimationFrame(loop);
}

function init() {
  resizeCanvases();
  wireControls();
  updateFormulaPanel();
  requestAnimationFrame(loop);
}
window.addEventListener('load', init);
