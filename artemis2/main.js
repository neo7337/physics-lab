/* ═══════════════════════════════════════════════════════════════════════════
   Artemis 2 Trajectory Simulator — main.js
   Pre-computes full trajectory via RK4, animates spacecraft along it.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

// ─── Physical Constants ──────────────────────────────────────────────────────
const GM_EARTH   = 3.986004418e14;          // m³/s²
const GM_MOON    = 4.9048695e12;            // m³/s²
const R_EARTH    = 6.371e6;                 // m
const R_MOON     = 1.7374e6;               // m
const A_MOON     = 3.84400e8;              // m  mean orbital radius
const T_MOON     = 27.3217 * 86400;        // s  sidereal period
const OMEGA_MOON = 2 * Math.PI / T_MOON;   // rad/s
const R_SOI_MOON = A_MOON * Math.pow(GM_MOON / GM_EARTH, 2 / 5); // ~66 200 km
const SIM_DT     = 60;                     // integrator timestep, seconds

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  // Pre-computed full trajectory — array of {x, y, vx, vy, t}
  path: [],
  // Playback index into path[]
  playIdx: 0,
  // Fractional playback position (for sub-step interpolation)
  playFrac: 0,

  // Mission event indices/times
  tliIdx: 0,
  flybyIdx: null,
  splashIdx: null,

  // Controls
  tliDv: 3140,           // m/s
  tliBurnAngle: 0,       // degrees offset from prograde
  flybyTargetAlt: 8900e3, // m
  timeWarp: 5000,        // simulation-seconds per wall-second

  // Toggles
  animate: true,
  showTrail: true,
  showSoi: true,
  showVel: true,
  rotating: false,

  // Graph data sampled from path[]
  graphData: [],
};

// ─── Canvases ────────────────────────────────────────────────────────────────
const trajCanvas  = document.getElementById('traj-canvas');
const graphCanvas = document.getElementById('graph-canvas');
const tCtx = trajCanvas.getContext('2d');
const gCtx = graphCanvas.getContext('2d');
let TW, TH, GW, GH;

function resizeCanvases() {
  const pr = window.devicePixelRatio || 1;
  const tb = trajCanvas.parentElement.getBoundingClientRect();
  TW = Math.round(tb.width  * pr);
  TH = Math.round(tb.height * pr);
  trajCanvas.width  = TW; trajCanvas.height = TH;
  trajCanvas.style.width  = tb.width  + 'px';
  trajCanvas.style.height = tb.height + 'px';

  const gb = graphCanvas.parentElement.getBoundingClientRect();
  GW = Math.round(gb.width  * pr);
  GH = Math.round(gb.height * pr);
  graphCanvas.width  = GW; graphCanvas.height = GH;
  graphCanvas.style.width  = gb.width  + 'px';
  graphCanvas.style.height = gb.height + 'px';
}
window.addEventListener('resize', resizeCanvases);

// ─── Moon Position ────────────────────────────────────────────────────────────
function moonPos(t) {
  return {
    x: A_MOON * Math.cos(OMEGA_MOON * t),
    y: A_MOON * Math.sin(OMEGA_MOON * t),
  };
}

// ─── RK4 ─────────────────────────────────────────────────────────────────────
function derivatives(x, y, vx, vy, t) {
  const moon = moonPos(t);
  const re2 = x*x + y*y, re = Math.sqrt(re2);
  const axE = -GM_EARTH * x / (re2 * re);
  const ayE = -GM_EARTH * y / (re2 * re);
  const dxm = x - moon.x, dym = y - moon.y;
  const rm2 = dxm*dxm + dym*dym, rm = Math.sqrt(rm2);
  const axM = -GM_MOON * dxm / (rm2 * rm);
  const ayM = -GM_MOON * dym / (rm2 * rm);
  return { dx: vx, dy: vy, dvx: axE + axM, dvy: ayE + ayM };
}

function rk4Step(x, y, vx, vy, t, dt) {
  const k1 = derivatives(x, y, vx, vy, t);
  const k2 = derivatives(x + .5*dt*k1.dx, y + .5*dt*k1.dy, vx + .5*dt*k1.dvx, vy + .5*dt*k1.dvy, t + .5*dt);
  const k3 = derivatives(x + .5*dt*k2.dx, y + .5*dt*k2.dy, vx + .5*dt*k2.dvx, vy + .5*dt*k2.dvy, t + .5*dt);
  const k4 = derivatives(x + dt*k3.dx,    y + dt*k3.dy,    vx + dt*k3.dvx,    vy + dt*k3.dvy,    t + dt);
  return {
    x:  x  + dt/6 * (k1.dx  + 2*k2.dx  + 2*k3.dx  + k4.dx),
    y:  y  + dt/6 * (k1.dy  + 2*k2.dy  + 2*k3.dy  + k4.dy),
    vx: vx + dt/6 * (k1.dvx + 2*k2.dvx + 2*k3.dvx + k4.dvx),
    vy: vy + dt/6 * (k1.dvy + 2*k2.dvy + 2*k3.dvy + k4.dvy),
  };
}

// ─── Full Trajectory Pre-computation ─────────────────────────────────────────
// Runs the entire simulation synchronously, stores every step.
// Max mission ~15 days = 21600 steps at 60 s each.
function computeFullTrajectory() {
  const r0 = R_EARTH + 185e3;
  const v0 = Math.sqrt(GM_EARTH / r0);

  // Compute TLI departure time so the transfer orbit apogee aligns with the Moon at arrival.
  // Transfer orbit: perigee = r0, apogee ≈ A_MOON  →  semi-major axis = (r0 + A_MOON)/2
  // Half-period (LEO → Moon) = π √(a³/GM)
  // At TLI, spacecraft is at orbital angle θ_dep = OMEGA_LEO * t_tli.
  // Apogee direction = θ_dep + π.
  // Moon must be at that direction at arrival: OMEGA_MOON*(t_tli + T_half) = θ_dep + π
  // ⟹  t_tli = (π − OMEGA_MOON*T_half) / (OMEGA_MOON − OMEGA_LEO)
  const OMEGA_LEO  = 2 * Math.PI / (2 * Math.PI * Math.sqrt(r0*r0*r0 / GM_EARTH));
  const A_TR       = (r0 + A_MOON) / 2;
  const T_HALF_TR  = Math.PI * Math.sqrt(A_TR*A_TR*A_TR / GM_EARTH);
  const T_LEO      = 2 * Math.PI / OMEGA_LEO;

  let tliTime = (Math.PI - OMEGA_MOON * T_HALF_TR) / (OMEGA_MOON - OMEGA_LEO);
  // Shift into the first positive window (≥ 1 full LEO orbit for clarity)
  while (tliTime < T_LEO) tliTime += T_LEO;

  let x = r0, y = 0, vx = 0, vy = v0, t = 0;

  let phase = 0;  // 0=LEO, 1=trans-lunar, 2=returning
  let prevMoonDist = Infinity;

  const path = [];
  const graphData = [];

  let tliIdx   = 0;
  let flybyIdx = null;
  let splashIdx = null;

  const MAX_STEPS = 22000; // safety cap (~15.3 days)

  for (let step = 0; step < MAX_STEPS; step++) {
    // Apply TLI burn (instantaneous Δv at tliTime)
    if (phase === 0 && t >= tliTime) {
      const speed = Math.sqrt(vx*vx + vy*vy);
      // Prograde unit vector (direction of motion)
      const px = vx / speed, py = vy / speed;
      // Rotate by burn angle
      const ang = state.tliBurnAngle * Math.PI / 180;
      const bx = px * Math.cos(ang) - py * Math.sin(ang);
      const by = px * Math.sin(ang) + py * Math.cos(ang);
      // Flyby altitude radial correction (nominal ≈ 8900 km above Moon surface)
      // Positive altCorr = larger periselene → add outward radial Δv
      const nominalFlybyAlt = 8900e3; // m above Moon surface
      const altCorr = (state.flybyTargetAlt - nominalFlybyAlt) * 1.5e-6;
      const r = Math.sqrt(x*x + y*y);
      const rx = x/r, ry = y/r;
      vx += state.tliDv * bx + altCorr * rx;
      vy += state.tliDv * by + altCorr * ry;
      phase = 1;
      tliIdx = path.length;
    }

    // Store current state
    path.push({ x, y, vx, vy, t });

    // Graph sample (every 10 steps to keep array small)
    if (step % 10 === 0) {
      const moon = moonPos(t);
      const earthR = Math.sqrt(x*x + y*y);
      const dxm = x - moon.x, dym = y - moon.y;
      const moonDist = Math.sqrt(dxm*dxm + dym*dym);
      graphData.push({
        met: t,
        earthAlt: (earthR - R_EARTH) / 1000,
        moonDist: moonDist / 1000,
      });
    }

    // Detect flyby (minimum Moon distance)
    if (phase === 1) {
      const moon = moonPos(t);
      const dxm = x - moon.x, dym = y - moon.y;
      const moonDist = Math.sqrt(dxm*dxm + dym*dym);
      if (moonDist > prevMoonDist && t > tliTime + 3600) {
        flybyIdx = path.length - 1;
        phase = 2;
      }
      prevMoonDist = moonDist;
    }

    // Splashdown check (altitude < 200 km on return leg)
    const earthR = Math.sqrt(x*x + y*y);
    if (phase >= 1 && (earthR - R_EARTH) < 200e3 && t > tliTime + 3600) {
      splashIdx = path.length - 1;
      break;
    }

    // Safety: escape detection
    if (earthR > 1.5 * A_MOON) {
      splashIdx = path.length - 1;
      break;
    }

    // RK4 integrate to next step
    const next = rk4Step(x, y, vx, vy, t, SIM_DT);
    x = next.x; y = next.y; vx = next.vx; vy = next.vy;
    t += SIM_DT;
  }

  return { path, graphData, tliIdx, flybyIdx, splashIdx };
}

// ─── Reset ────────────────────────────────────────────────────────────────────
function resetSimulation() {
  document.getElementById('ev-flyby').textContent  = '\u2014';
  document.getElementById('ev-splash').textContent = '\u2014';

  const result = computeFullTrajectory();
  state.path      = result.path;
  state.graphData = result.graphData;
  state.tliIdx    = result.tliIdx;
  state.flybyIdx  = result.flybyIdx;
  state.splashIdx = result.splashIdx;
  state.playIdx   = 0;
  state.playFrac  = 0;

  // Update event time labels
  if (result.flybyIdx !== null) {
    const ft = result.path[result.flybyIdx].t;
    document.getElementById('ev-flyby').textContent = 'MET +' + fmtHours(ft);
  }
  if (result.splashIdx !== null) {
    const st = result.path[result.splashIdx].t;
    document.getElementById('ev-splash').textContent = 'MET +' + fmtHours(st);
  }

  updateFormulaPanel();
}

// ─── Playback Advance ─────────────────────────────────────────────────────────
function advancePlayback(wallDt) {
  if (!state.path.length) return;
  const endIdx = state.path.length - 1;
  if (state.playIdx >= endIdx) return;

  // Advance by timeWarp seconds of sim-time per wall-second
  const simAdvance = wallDt * state.timeWarp;
  const stepAdvance = simAdvance / SIM_DT;
  state.playFrac += stepAdvance;
  const steps = Math.floor(state.playFrac);
  state.playFrac -= steps;
  state.playIdx = Math.min(state.playIdx + steps, endIdx);
}

// ─── Coordinate Transforms ────────────────────────────────────────────────────
function getViewTransform(W, H) {
  const scale = (Math.min(W, H) / 2) * 0.6 / (A_MOON * 1.05);
  return { scale, cx: W / 2, cy: H / 2 };
}

function toFrame(x, y, t) {
  if (!state.rotating) return { fx: x, fy: y };
  const angle = -OMEGA_MOON * t;
  const c = Math.cos(angle), s = Math.sin(angle);
  return { fx: x*c - y*s, fy: x*s + y*c };
}

function worldToCanvas(wx, wy, W, H) {
  const { scale, cx, cy } = getViewTransform(W, H);
  return { px: cx + wx * scale, py: cy - wy * scale };
}

// ─── Drawing ──────────────────────────────────────────────────────────────────
function drawTrajectory() {
  tCtx.clearRect(0, 0, TW, TH);
  tCtx.fillStyle = '#0a0e14';
  tCtx.fillRect(0, 0, TW, TH);
  drawStars();

  const path    = state.path;
  const playIdx = state.playIdx;
  const pr2     = window.devicePixelRatio || 1;

  if (path.length === 0) return;

  const currentT = path[playIdx].t;
  const moon     = moonPos(currentT);
  const { fx: moonFx, fy: moonFy } = toFrame(moon.x, moon.y, currentT);

  // Moon orbit ring (inertial only)
  if (!state.rotating) {
    const { scale } = getViewTransform(TW, TH);
    tCtx.beginPath();
    tCtx.arc(TW/2, TH/2, A_MOON * scale, 0, Math.PI*2);
    tCtx.strokeStyle = 'rgba(255,255,255,0.06)';
    tCtx.lineWidth = pr2;
    tCtx.setLineDash([3, 8]);
    tCtx.stroke();
    tCtx.setLineDash([]);
  }

  // Moon SOI
  if (state.showSoi) {
    const { scale } = getViewTransform(TW, TH);
    const { px, py } = worldToCanvas(moonFx, moonFy, TW, TH);
    tCtx.beginPath();
    tCtx.arc(px, py, R_SOI_MOON * scale, 0, Math.PI*2);
    tCtx.setLineDash([6, 6]);
    tCtx.strokeStyle = 'rgba(200,200,200,0.22)';
    tCtx.lineWidth = pr2;
    tCtx.stroke();
    tCtx.setLineDash([]);
  }

  // ── Full trajectory path ─────────────────────────────────────────────────
  // Draw in two passes: future (dim) then past (bright)
  if (state.showTrail && path.length > 1) {
    // Subsample path for rendering (every N points to keep line smooth but fast)
    const SUBSAMPLE = Math.max(1, Math.floor(path.length / 1200));

    // Future path (dim dashed)
    if (playIdx < path.length - 1) {
      tCtx.beginPath();
      let started = false;
      for (let i = playIdx; i < path.length; i += SUBSAMPLE) {
        const pt = path[i];
        const { fx, fy } = toFrame(pt.x, pt.y, pt.t);
        const { px, py } = worldToCanvas(fx, fy, TW, TH);
        if (!started) { tCtx.moveTo(px, py); started = true; }
        else tCtx.lineTo(px, py);
      }
      // Ensure last point included
      const last = path[path.length - 1];
      const { fx: lfx, fy: lfy } = toFrame(last.x, last.y, last.t);
      const { px: lpx, py: lpy } = worldToCanvas(lfx, lfy, TW, TH);
      tCtx.lineTo(lpx, lpy);
      tCtx.strokeStyle = 'rgba(200,170,60,0.18)';
      tCtx.lineWidth = 1.2 * pr2;
      tCtx.setLineDash([4, 6]);
      tCtx.stroke();
      tCtx.setLineDash([]);
    }

    // Past path (bright solid, with color shift: outbound=gold, inbound=orange)
    const flybyI = state.flybyIdx || playIdx;
    if (playIdx > 0) {
      // Outbound leg: launch → flyby
      const outEnd = Math.min(playIdx, flybyI);
      if (outEnd > 0) {
        tCtx.beginPath();
        let started = false;
        for (let i = 0; i <= outEnd; i += SUBSAMPLE) {
          const pt = path[i];
          const { fx, fy } = toFrame(pt.x, pt.y, pt.t);
          const { px, py } = worldToCanvas(fx, fy, TW, TH);
          if (!started) { tCtx.moveTo(px, py); started = true; }
          else tCtx.lineTo(px, py);
        }
        tCtx.strokeStyle = '#e3b341';
        tCtx.lineWidth = 1.8 * pr2;
        tCtx.globalAlpha = 0.75;
        tCtx.stroke();
        tCtx.globalAlpha = 1;
      }
      // Return leg: flyby → current
      if (playIdx > flybyI) {
        tCtx.beginPath();
        let started = false;
        for (let i = flybyI; i <= playIdx; i += SUBSAMPLE) {
          const pt = path[i];
          const { fx, fy } = toFrame(pt.x, pt.y, pt.t);
          const { px, py } = worldToCanvas(fx, fy, TW, TH);
          if (!started) { tCtx.moveTo(px, py); started = true; }
          else tCtx.lineTo(px, py);
        }
        tCtx.strokeStyle = '#f78166';
        tCtx.lineWidth = 1.8 * pr2;
        tCtx.globalAlpha = 0.75;
        tCtx.stroke();
        tCtx.globalAlpha = 1;
      }
    }
  }

  // Earth
  {
    const { fx, fy } = toFrame(0, 0, currentT);
    const { px, py } = worldToCanvas(fx, fy, TW, TH);
    const { scale }  = getViewTransform(TW, TH);
    const er = Math.max(7 * pr2, R_EARTH * scale);
    const grd = tCtx.createRadialGradient(px, py, er*0.4, px, py, er*2.5);
    grd.addColorStop(0, 'rgba(61,166,255,0.32)');
    grd.addColorStop(1, 'rgba(61,166,255,0)');
    tCtx.beginPath(); tCtx.arc(px, py, er*2.5, 0, Math.PI*2);
    tCtx.fillStyle = grd; tCtx.fill();
    const eg = tCtx.createRadialGradient(px-er*0.3, py-er*0.3, er*0.1, px, py, er);
    eg.addColorStop(0, '#6bbfff'); eg.addColorStop(0.5, '#2563a8'); eg.addColorStop(1, '#0d1e3a');
    tCtx.beginPath(); tCtx.arc(px, py, er, 0, Math.PI*2);
    tCtx.fillStyle = eg; tCtx.fill();
    tCtx.strokeStyle = 'rgba(100,180,255,0.45)'; tCtx.lineWidth = pr2; tCtx.stroke();
    tCtx.fillStyle = 'rgba(150,200,255,0.7)';
    tCtx.font = `${Math.round(10*pr2)}px 'Segoe UI',sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.fillText('Earth', px, py + er + 14*pr2);
  }

  // Moon (at current simulation time)
  {
    const { px, py } = worldToCanvas(moonFx, moonFy, TW, TH);
    const { scale }  = getViewTransform(TW, TH);
    const mr = Math.max(4*pr2, R_MOON * scale);
    const mg = tCtx.createRadialGradient(px-mr*0.3, py-mr*0.3, mr*0.1, px, py, mr);
    mg.addColorStop(0, '#d8d8d8'); mg.addColorStop(0.6, '#888'); mg.addColorStop(1, '#444');
    tCtx.beginPath(); tCtx.arc(px, py, mr, 0, Math.PI*2);
    tCtx.fillStyle = mg; tCtx.fill();
    tCtx.strokeStyle = 'rgba(180,180,180,0.35)'; tCtx.lineWidth = pr2; tCtx.stroke();
    tCtx.fillStyle = 'rgba(200,200,200,0.7)';
    tCtx.font = `${Math.round(10*pr2)}px 'Segoe UI',sans-serif`;
    tCtx.textAlign = 'center';
    tCtx.fillText('Moon', px, py + mr + 14*pr2);
  }

  // Ghost Moon at flyby position (inertial frame only — shows where Moon was)
  if (!state.rotating && state.flybyIdx !== null) {
    const flybyT  = path[state.flybyIdx].t;
    const flybyM  = moonPos(flybyT);
    const { px, py } = worldToCanvas(flybyM.x, flybyM.y, TW, TH);
    const { scale }  = getViewTransform(TW, TH);
    const mr = Math.max(4*pr2, R_MOON * scale);
    tCtx.beginPath(); tCtx.arc(px, py, mr, 0, Math.PI*2);
    tCtx.strokeStyle = 'rgba(180,180,180,0.2)';
    tCtx.lineWidth = pr2;
    tCtx.setLineDash([2, 4]);
    tCtx.stroke();
    tCtx.setLineDash([]);
  }

  // Spacecraft (Orion)
  {
    const pt = path[playIdx];
    const { fx, fy } = toFrame(pt.x, pt.y, pt.t);
    let { px, py } = worldToCanvas(fx, fy, TW, TH);
    const isFinished = playIdx >= path.length - 1;

    // When near/inside Earth's visual radius (e.g. splashdown), clamp dot
    // to just outside the Earth graphic so the marker stays visible.
    {
      const { px: epx, py: epy } = worldToCanvas(0, 0, TW, TH);
      const { scale } = getViewTransform(TW, TH);
      const er = Math.max(7 * pr2, R_EARTH * scale);
      const dx = px - epx, dy = py - epy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < er + 8 * pr2) {
        // canvas y is inverted: canvas-angle = atan2(-fy, fx)
        const ang = (Math.abs(fx) > 0.1 || Math.abs(fy) > 0.1)
          ? Math.atan2(-fy, fx)
          : Math.atan2(dy, dx);
        px = epx + (er + 9 * pr2) * Math.cos(ang);
        py = epy + (er + 9 * pr2) * Math.sin(ang);
      }
    }

    // Velocity vector
    if (state.showVel && playIdx >= state.tliIdx && !isFinished) {
      let vx = pt.vx, vy = pt.vy;
      if (state.rotating) {
        const ang = -OMEGA_MOON * pt.t;
        const c = Math.cos(ang), s = Math.sin(ang);
        [vx, vy] = [vx*c - vy*s, vx*s + vy*c];
      }
      const speed  = Math.sqrt(vx*vx + vy*vy);
      const velLen = 30 * pr2;
      const vdx = (vx/speed)*velLen, vdy = -(vy/speed)*velLen;
      tCtx.beginPath();
      tCtx.moveTo(px, py);
      tCtx.lineTo(px+vdx, py+vdy);
      tCtx.strokeStyle = '#3fb950'; tCtx.lineWidth = 1.5*pr2; tCtx.stroke();
      const ang2 = Math.atan2(vdy, vdx), al = 7*pr2;
      tCtx.beginPath();
      tCtx.moveTo(px+vdx, py+vdy);
      tCtx.lineTo(px+vdx - al*Math.cos(ang2-0.4), py+vdy - al*Math.sin(ang2-0.4));
      tCtx.lineTo(px+vdx - al*Math.cos(ang2+0.4), py+vdy - al*Math.sin(ang2+0.4));
      tCtx.closePath(); tCtx.fillStyle = '#3fb950'; tCtx.fill();
    }

    // Dot
    const dotR = 4 * pr2;
    const dotColor = isFinished ? '#f78166' : '#f0c040';
    const glowColor = isFinished ? 'rgba(247,129,102,0.55)' : 'rgba(240,196,64,0.55)';
    const grd = tCtx.createRadialGradient(px, py, 0, px, py, dotR*3);
    grd.addColorStop(0, glowColor); grd.addColorStop(1, 'rgba(0,0,0,0)');
    tCtx.beginPath(); tCtx.arc(px, py, dotR*3, 0, Math.PI*2);
    tCtx.fillStyle = grd; tCtx.fill();
    tCtx.beginPath(); tCtx.arc(px, py, dotR, 0, Math.PI*2);
    tCtx.fillStyle = dotColor; tCtx.fill();

    // Splashdown label
    if (isFinished && state.splashIdx !== null) {
      tCtx.fillStyle = '#f78166';
      tCtx.font = `bold ${Math.round(11*pr2)}px 'Segoe UI',sans-serif`;
      tCtx.textAlign = 'center';
      tCtx.fillText('Splashdown', px, py - dotR*3.5);
    }
  }

  // Legend for trail colors
  {
    const lx = 14*pr2, ly = 20*pr2;
    tCtx.font = `${Math.round(9*pr2)}px 'Segoe UI',sans-serif`;
    tCtx.textAlign = 'left';
    tCtx.fillStyle = '#e3b341'; tCtx.fillRect(lx, ly,       18*pr2, 2*pr2);
    tCtx.fillStyle = 'rgba(200,170,60,0.4)'; tCtx.fillText('outbound', lx+22*pr2, ly+3*pr2);
    tCtx.fillStyle = '#f78166'; tCtx.fillRect(lx, ly+12*pr2, 18*pr2, 2*pr2);
    tCtx.fillStyle = 'rgba(220,120,80,0.6)'; tCtx.fillText('return',   lx+22*pr2, ly+15*pr2);
    tCtx.setLineDash([4,6]);
    tCtx.beginPath(); tCtx.moveTo(lx, ly+26*pr2); tCtx.lineTo(lx+18*pr2, ly+26*pr2);
    tCtx.strokeStyle = 'rgba(200,170,60,0.35)'; tCtx.lineWidth = pr2; tCtx.stroke();
    tCtx.setLineDash([]);
    tCtx.fillStyle = 'rgba(200,170,60,0.4)'; tCtx.fillText('future',   lx+22*pr2, ly+29*pr2);
  }

  // Frame label
  tCtx.fillStyle = 'rgba(140,160,180,0.55)';
  tCtx.font = `${Math.round(9*pr2)}px 'Courier New',monospace`;
  tCtx.textAlign = 'right';
  tCtx.fillText(
    state.rotating ? 'ROTATING FRAME' : 'INERTIAL FRAME',
    TW - 10*pr2, TH - 10*pr2
  );
  tCtx.textAlign = 'left';

  drawScaleBar();
}

// ─── Stars ────────────────────────────────────────────────────────────────────
let _stars = null;
function drawStars() {
  if (!_stars) {
    _stars = [];
    const rng = mulberry32(0xdeadbeef);
    for (let i = 0; i < 220; i++)
      _stars.push({ rx: rng(), ry: rng(), r: rng()*1.2+0.3, a: rng()*0.55+0.2 });
  }
  const pr2 = window.devicePixelRatio || 1;
  for (const s of _stars) {
    tCtx.beginPath();
    tCtx.arc(s.rx*TW, s.ry*TH, s.r*pr2, 0, Math.PI*2);
    tCtx.fillStyle = `rgba(255,255,255,${s.a})`;
    tCtx.fill();
  }
}

function mulberry32(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a>>>15, 1|a);
    t = t + Math.imul(t ^ t>>>7, 61|t) ^ t;
    return ((t ^ t>>>14) >>> 0) / 4294967296;
  };
}

function drawScaleBar() {
  const { scale } = getViewTransform(TW, TH);
  const pr2 = window.devicePixelRatio || 1;
  const targetPx = 80*pr2;
  const targetM  = targetPx / scale;
  const mag = Math.pow(10, Math.floor(Math.log10(targetM/1000)));
  const niceTkm = [1,2,5,10,20,50,100,200,500].map(v=>v*mag)
    .find(v => v*1000*scale >= targetPx) || 100e3;
  const barPx = niceTkm*1000*scale;
  const x0 = 16*pr2, y0 = TH - 28*pr2;
  tCtx.fillStyle = 'rgba(140,160,180,0.5)';
  tCtx.fillRect(x0, y0, barPx, pr2);
  tCtx.fillRect(x0, y0-4*pr2, pr2, 8*pr2);
  tCtx.fillRect(x0+barPx, y0-4*pr2, pr2, 8*pr2);
  tCtx.font = `${Math.round(9*pr2)}px 'Courier New',monospace`;
  tCtx.fillStyle = 'rgba(140,160,180,0.7)';
  tCtx.textAlign = 'left';
  tCtx.fillText(
    niceTkm >= 1000 ? `${(niceTkm/1000).toFixed(0)} 000 km` : `${niceTkm.toFixed(0)} km`,
    x0, y0 - 8*pr2
  );
}

// ─── Graph ────────────────────────────────────────────────────────────────────
function drawGraph() {
  gCtx.clearRect(0, 0, GW, GH);
  gCtx.fillStyle = '#0a0e14';
  gCtx.fillRect(0, 0, GW, GH);

  const data = state.graphData;
  if (data.length < 2) return;

  const pr2 = window.devicePixelRatio || 1;
  const padL=44*pr2, padR=14*pr2, padT=12*pr2, padB=28*pr2;
  const W = GW-padL-padR, H = GH-padT-padB;

  const tMin = data[0].met, tMax = data[data.length-1].met;
  const tSpan = Math.max(tMax - tMin, 3600);
  const yMax = Math.max(...data.map(d => Math.max(d.earthAlt, d.moonDist))) * 1.08;

  const tx = met => padL + (met-tMin)/tSpan * W;
  const ty = km  => padT + H - km/yMax * H;

  // Grid
  gCtx.strokeStyle = 'rgba(48,54,61,0.7)'; gCtx.lineWidth = pr2;
  for (let i = 0; i <= 4; i++) {
    const y = padT + H*i/4;
    gCtx.beginPath(); gCtx.moveTo(padL, y); gCtx.lineTo(padL+W, y); gCtx.stroke();
    const label = ((yMax*(1-i/4))/1000).toFixed(0)+'k';
    gCtx.fillStyle = 'rgba(140,160,180,0.5)';
    gCtx.font = `${Math.round(8*pr2)}px 'Courier New',monospace`;
    gCtx.textAlign = 'right';
    gCtx.fillText(label, padL-4*pr2, y+3*pr2);
  }

  // Full trajectory lines (always visible)
  // Moon distance
  gCtx.beginPath();
  data.forEach((d, i) => i===0 ? gCtx.moveTo(tx(d.met), ty(d.moonDist)) : gCtx.lineTo(tx(d.met), ty(d.moonDist)));
  gCtx.strokeStyle = 'rgba(200,200,200,0.35)'; gCtx.lineWidth = 1.5*pr2; gCtx.stroke();

  // Earth altitude — color-split at flyby
  const flybyT = state.flybyIdx !== null ? state.path[state.flybyIdx].t : Infinity;
  // Outbound
  gCtx.beginPath();
  let first = true;
  for (const d of data) {
    if (d.met > flybyT) break;
    first ? (gCtx.moveTo(tx(d.met), ty(d.earthAlt)), first=false) : gCtx.lineTo(tx(d.met), ty(d.earthAlt));
  }
  gCtx.strokeStyle = '#e3b341'; gCtx.lineWidth = 2*pr2; gCtx.stroke();
  // Return
  gCtx.beginPath(); first = true;
  for (const d of data) {
    if (d.met < flybyT) continue;
    first ? (gCtx.moveTo(tx(d.met), ty(d.earthAlt)), first=false) : gCtx.lineTo(tx(d.met), ty(d.earthAlt));
  }
  gCtx.strokeStyle = '#f78166'; gCtx.lineWidth = 2*pr2; gCtx.stroke();

  // Event markers
  const drawMarker = (t, color, label) => {
    if (t == null) return;
    const x = tx(t);
    gCtx.beginPath(); gCtx.moveTo(x, padT); gCtx.lineTo(x, padT+H);
    gCtx.strokeStyle = color; gCtx.lineWidth = pr2;
    gCtx.setLineDash([3,4]); gCtx.stroke(); gCtx.setLineDash([]);
    gCtx.fillStyle = color;
    gCtx.font = `${Math.round(8*pr2)}px 'Segoe UI',sans-serif`;
    gCtx.textAlign = 'center';
    gCtx.fillText(label, x, padT-2*pr2);
  };
  drawMarker(state.path[state.tliIdx]?.t,                       '#58a6ff', 'TLI');
  drawMarker(state.flybyIdx  != null ? state.path[state.flybyIdx].t  : null, '#e3b341', 'Flyby');
  drawMarker(state.splashIdx != null ? state.path[state.splashIdx].t : null, '#f78166', 'Splash');

  // Current time playhead
  const currentT = state.path[state.playIdx]?.t;
  if (currentT != null) {
    const x = Math.min(tx(currentT), padL+W);
    gCtx.beginPath(); gCtx.moveTo(x, padT); gCtx.lineTo(x, padT+H);
    gCtx.strokeStyle = 'rgba(240,196,64,0.8)'; gCtx.lineWidth = 1.5*pr2; gCtx.stroke();
  }

  // Axis labels
  gCtx.fillStyle = 'rgba(140,160,180,0.55)';
  gCtx.font = `${Math.round(8*pr2)}px 'Segoe UI',sans-serif`;
  gCtx.textAlign = 'left';
  gCtx.fillText('km', padL-38*pr2, padT+8*pr2);
  gCtx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const met = tMin + i/5*tSpan;
    gCtx.fillStyle = 'rgba(140,160,180,0.5)';
    gCtx.font = `${Math.round(8*pr2)}px 'Courier New',monospace`;
    gCtx.fillText(fmtHoursShort(met)+'h', padL + i/5*W, padT+H+18*pr2);
  }

  // Legend
  const lx = padL+W-90*pr2;
  gCtx.font = `${Math.round(9*pr2)}px 'Segoe UI',sans-serif`;
  gCtx.textAlign = 'left';
  gCtx.fillStyle = '#e3b341';   gCtx.fillText('Earth alt (out)', lx, padT+13*pr2);
  gCtx.fillStyle = '#f78166';   gCtx.fillText('Earth alt (ret)', lx, padT+25*pr2);
  gCtx.fillStyle = 'rgba(200,200,200,0.6)'; gCtx.fillText('Moon dist',     lx, padT+37*pr2);
}

// ─── Formula Panel ────────────────────────────────────────────────────────────
function fmtHours(t) {
  const h = Math.floor(t/3600), m = Math.floor((t%3600)/60);
  return `${h}h ${m.toString().padStart(2,'0')}m`;
}
function fmtHoursShort(t) { return (t/3600).toFixed(0); }
function fmtKm(m) {
  if (m >= 1e6) return (m/1e6).toFixed(3)+' M km';
  if (m >= 1e3) return (m/1e3).toFixed(0)+' km';
  return m.toFixed(0)+' m';
}
function fmtSpeed(v) { return (v/1000).toFixed(2)+' km/s'; }

function updateFormulaPanel() {
  document.getElementById('soi-val').textContent = `r_SOI ≈ ${(R_SOI_MOON/1000).toFixed(0)} km`;

  const path = state.path;
  if (!path.length) return;
  const pt = path[state.playIdx];
  if (!pt) return;

  const earthR = Math.sqrt(pt.x*pt.x + pt.y*pt.y);
  const moon   = moonPos(pt.t);
  const dxm = pt.x - moon.x, dym = pt.y - moon.y;
  const moonDist = Math.sqrt(dxm*dxm + dym*dym);
  const speed    = Math.sqrt(pt.vx*pt.vx + pt.vy*pt.vy);

  document.getElementById('p-met').textContent   = fmtHours(pt.t);
  document.getElementById('p-alt').textContent   = fmtKm(earthR - R_EARTH);
  document.getElementById('p-vel').textContent   = fmtSpeed(speed);
  document.getElementById('p-dv').textContent    = (state.tliDv/1000).toFixed(2)+' km/s';
  document.getElementById('p-moon').textContent  = fmtKm(moonDist - R_MOON);
  document.getElementById('p-frame').textContent = state.rotating ? 'Rotating' : 'Inertial';

  document.getElementById('frame-label').textContent = state.rotating
    ? 'Rotating Frame — Earth-Moon Co-rotating'
    : 'Inertial Frame — Earth-Centered';
}

// ─── Controls ─────────────────────────────────────────────────────────────────
function wireControls() {
  function bind(id, key, fmt, scale) {
    const el  = document.getElementById(id);
    const val = document.getElementById(id+'-val');
    el.addEventListener('input', () => {
      state[key] = parseFloat(el.value) * scale;
      val.textContent = fmt(parseFloat(el.value));
      resetSimulation();
    });
  }

  bind('tli-dv',    'tliDv',
    v => `${parseFloat(v).toFixed(2)} km/s`, 1000);
  bind('tli-angle', 'tliBurnAngle',
    v => `${parseFloat(v)>0?'+':''}${parseFloat(v).toFixed(1)}°`, 1);
  bind('flyby-alt', 'flybyTargetAlt',
    v => { const n=parseFloat(v); return n>=1000?`${n.toLocaleString('en')} km`:`${n} km`; }, 1000);
  bind('timewarp',  'timeWarp',
    v => { const n=parseFloat(v); return n>=1000?`${(n/1000).toFixed(0)} 000×`:`${n}×`; }, 1);

  const toggles = [
    ['toggle-trail',    'showTrail'],
    ['toggle-soi',      'showSoi'],
    ['toggle-vel',      'showVel'],
    ['toggle-rotating', 'rotating'],
  ];
  for (const [id, key] of toggles) {
    document.getElementById(id).addEventListener('change', e => {
      state[key] = e.target.checked;
      updateFormulaPanel();
    });
  }

  // ── Playback bar ────────────────────────────────────────────────────────
  const pbPlay  = document.getElementById('pb-play');
  const pbReset = document.getElementById('pb-reset');
  const pbScrub = document.getElementById('pb-scrubber');
  const pbTime  = document.getElementById('pb-time');

  function updatePlayBtn() {
    pbPlay.textContent = state.animate ? '\u23F8' : '\u25B6';
    pbPlay.classList.toggle('pb-btn--primary', state.animate);
  }

  pbPlay.addEventListener('click', () => {
    state.animate = !state.animate;
    updatePlayBtn();
  });

  pbReset.addEventListener('click', () => {
    resetSimulation();
    state.animate = true;
    updatePlayBtn();
  });

  pbScrub.addEventListener('input', () => {
    const frac = parseInt(pbScrub.value) / 1000;
    state.playIdx  = Math.round(frac * (state.path.length - 1));
    state.playFrac = 0;
    state.animate  = false;
    updatePlayBtn();
  });

  // Expose so animation loop can sync scrubber + time display
  state._syncPlaybackUI = () => {
    if (!state.path.length) return;
    const frac = state.playIdx / (state.path.length - 1);
    pbScrub.value = Math.round(frac * 1000);
    const pt = state.path[state.playIdx];
    if (pt) pbTime.textContent = 'MET +' + fmtHours(pt.t);
  };

  updatePlayBtn();
}

// ─── Animation Loop ───────────────────────────────────────────────────────────
let lastTime = 0;
function loop(timestamp) {
  const wallDt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  if (state.animate) advancePlayback(wallDt);

  drawTrajectory();
  drawGraph();
  updateFormulaPanel();
  if (state._syncPlaybackUI) state._syncPlaybackUI();

  requestAnimationFrame(loop);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  resizeCanvases();
  wireControls();
  resetSimulation();
  requestAnimationFrame(loop);
}

window.addEventListener('load', init);
