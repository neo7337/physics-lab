# Physics Lab — Guided Experiments

36 experiments across 6 simulators. Each entry lists the simulator settings and what to observe.

---

## Wave Optics

### Young's Double-Slit Experiment

**1. Measure Fringe Spacing**
Set λ=550 nm, d=1 mm, L=1 m. The formula predicts β = 0.55 mm. Observe the intensity graph and confirm the peak-to-peak spacing matches. Now double L to 2 m — does β double as expected?

**2. Single-Slit vs. Double-Slit Envelope**
Slowly increase slit width a from 0.01 mm toward d (the slit separation). Watch the single-slit envelope narrow and swallow outer fringes. At a = d/2, the m=±2 fringes disappear (missing order).

**3. Violet vs. Red Light**
Compare λ=400 nm (violet) with λ=700 nm (red), keeping all else equal. Red light produces fringes ~1.75× wider than violet. This is why a white-light double-slit pattern shows rainbow-colored fringes.

**4. The Central Maximum**
The m=0 fringe is always at the centre regardless of λ, d, or L. At y=0, both slits are equidistant (Δ=0), so all wavelengths constructively interfere — it would appear white with real white light.

**5. Wave Field Structure**
Pause the animation and look at the wave field. Trace the bright stripes radiating from the slits — these are lines of constructive interference. Count them: they correspond to fringe orders m=0, ±1, ±2 … on the screen.

**6. Fringe Count vs. Slit Separation**
With λ=550 nm and L=1 m, increase d from 0.5 mm to 5 mm. Count how many fringes fit in the central single-slit maximum. The number scales with d/a (the ratio of slit separation to slit width).

---

### Single-Slit Diffraction

**1. Diffraction vs. Slit Width**
Set λ=550 nm, L=1 m. Vary slit width from 1.0 mm down to 0.05 mm. Observe how the pattern widens dramatically as a decreases. Verify: central max half-width y₁ = λL/a.

**2. Wavelength Dependence**
Fix a=0.2 mm, L=1 m. Sweep wavelength from 380 nm (violet) to 750 nm (red). Red light diffracts more than violet — the pattern widens with λ.

**3. Geometric Optics Limit**
Set λ=550 nm. Increase slit width to 1.0 mm. The pattern nearly collapses to a single bright bar — the geometric optics regime where a ≫ λ.

**4. Secondary Maximum Intensities**
Set a=0.1 mm, L=1.5 m. Look at the first secondary maximum — it should be about 4.7% as bright as the central peak. Toggle minima labels to identify positions.

**5. Far-Field Condition**
The Fraunhofer approximation requires L ≫ a²/λ. For a=0.5 mm, λ=550 nm: minimum L = (0.5e-3)²/550e-9 ≈ 0.45 m. Try L=0.1 m and 2.0 m and compare.

**6. Missing Orders Connection**
Compare with the double-slit simulator. The sinc² envelope here is the same envelope that modulates double-slit fringes. When a = d/N, the Nth double-slit order falls exactly on a single-slit minimum.

---

### Diffraction Grating

**1. Effect of Slit Number**
Set N=2, observe broad fringes. Increase N to 6, then 12, then 20. Watch the fringes sharpen into narrow spikes as N increases — this is the grating's resolving power at work.

**2. Missing Orders**
Set d=1.0 mm, a=0.20 mm (d/a=5). Identify the missing 5th-order peak. Then try d=0.4 mm, a=0.20 mm (d/a=2) — the 2nd order disappears.

**3. Wavelength Separation**
Set N=20. Note how the m=±1 peaks for 400 nm (violet) vs 700 nm (red) fall at very different positions. This is how a spectrometer separates spectral lines.

**4. High vs. Low Dispersion**
Compare d=0.1 mm (high dispersion — orders widely spread) vs d=5.0 mm (low dispersion — orders compressed near center). High-dispersion gratings are used for fine spectroscopy.

**5. N-Slit vs. Double-Slit**
Set N=2 and compare with the double-slit simulator. They should produce identical patterns when a and d match. Increasing N narrows each fringe without changing the peak positions.

**6. Angular Dispersion**
Set λ=550 nm, d=0.5 mm. Record the m=+1 peak position. Now change λ to 580 nm. The shift Δy is proportional to Δλ·L·m/d — angular dispersion dθ/dλ = m/(d cosθ).

---

### Thin-Film Interference

**1. Anti-Reflection Coating**
Set n=1.38 (MgF₂), n₂=1.52 (glass), λ=550 nm. Quarter-wave thickness: t = λ/(4n) ≈ 100 nm. Set t=100 nm and observe R drops to near zero for green light.

**2. Soap Bubble Colors**
Set n=1.33, n₂=1.33 (air–water–air). Vary t from 0 to 1000 nm. Watch the spectrum oscillate between different colored peaks — mimicking the iridescent colors of a soap bubble.

**3. Oil-on-Water**
Set n=1.47 (oil), n₂=1.33 (water). Note only one π phase flip occurs (top surface: air→oil). Sweep t through 200–800 nm and observe the shifting rainbow of reflected colors.

**4. Angle Dependence**
Set t=400 nm, n=1.5. Increase θ from 0° to 70°. The spectrum shifts to shorter wavelengths (Bragg blueshift) — this is why soap bubble colors change as you tilt them.

**5. Zero Thickness (Black Film)**
Set t=0 nm. With one phase flip the OPD = 0, satisfying the destructive condition (R ≈ 0). This is the "black soap film" — no reflection at all near t=0.

**6. High-Index Film (TiO₂)**
Set n=2.35 (titanium dioxide), t=60 nm. Quarter-wave at λ ≈ 564 nm. Compare the much higher reflectance vs. the MgF₂ coating — high-n films give stronger interference effects.

---

## Waves

### Standing Waves on a String

**1. Mersenne's Laws — Tension**
Set n=1, μ=0.010 kg/m, L=1.0 m. Note the frequency at T=2 N. Increase T to 8 N (4× increase). Frequency should double (f ∝ √T). Verify: f = √4 × original.

**2. Mersenne's Laws — Length**
Fix T=2 N, μ=0.010 kg/m, n=1. Record f at L=1.0 m. Halve the length to L=0.5 m. Frequency should exactly double (f ∝ 1/L). This is the physics behind pressing a guitar string.

**3. Counting Nodes**
Step through modes n=1 to n=8. Count the red node dots at each mode — you should find exactly n+1 nodes (including both endpoints) and n green antinode dots.

**4. Damping Decay**
Set damping=0.3 and watch the amplitude decay exponentially. Switch to damping=0 and the oscillation persists forever — the ideal undamped case. Real strings decay in about 1–10 seconds.

**5. Higher Harmonics**
Select n=6 or n=8. Toggle the envelope. Note how the frequency is exactly 6× or 8× the fundamental — the integer-multiple relationship that makes musical tones sound harmonic.

**6. Heavy vs. Light String**
Fix T=2 N, L=1.0 m, n=1. Compare μ=0.001 kg/m (light) vs μ=0.1 kg/m (heavy). The light string vibrates ~10× faster — the same reason a cello's thick strings give lower pitch.

---

### Doppler Effect

**1. Classic Pitch Shift**
Set f_s=440 Hz, v=343 m/s. Increase source velocity to 100 m/s. "f ahead" rises to ~577 Hz; "f behind" drops to ~347 Hz. This is the ambulance/train effect.

**2. Sonic Singularity**
Slowly increase v_s toward 343 m/s (matching the wave speed). Watch "f ahead" climb rapidly toward infinity as M → 1. At M=1 the source outruns its own wavefronts.

**3. Mach Cone**
Set v_s=500 m/s (M ≈ 1.46 in 343 m/s air). A red dashed Mach cone appears. Increase v_s further — the cone angle θ = arcsin(1/M) narrows. Verify: at v_s=686 m/s (M=2), θ = 30°.

**4. Source vs. Observer Asymmetry**
Set v=343 m/s. Compare: (a) v_s=100 m/s, v_o=0 vs. (b) v_s=0, v_o=100 m/s. The observed frequencies differ, proving the Doppler formula is not symmetric in source and observer velocity.

**5. Wavefront Compression Visualization**
Enable wavefronts, set v_s=150 m/s. Watch the rings bunch up ahead of the source and stretch behind. Ring spacing (λ_obs) is proportional to 1/f_obs — verify visually.

**6. Observer Motion**
Set all velocities to zero, then set v_o=200 m/s (observer toward stationary source). Now try v_s=200 m/s (source toward stationary observer). Same relative speed — different frequency, because sound Doppler is asymmetric.

---

## Classical Mechanics

> **Implementation pattern:** 2D top-down or side-view canvas. Runge-Kutta 4th-order (RK4) integrator with fixed `dt` (e.g. 1/120 s), capped real-time step at 50 ms. State vector per body: `[x, y, vx, vy]`. Collision detection via circle–circle or circle–wall. Energy and momentum readouts updated each frame.

### Projectile Motion

**Controls:** launch angle (0–90°), initial speed (1–100 m/s), gravity g (1–20 m/s²), air-drag coefficient (0–0.5), launch height (0–50 m).  
**Canvases:** trajectory arc (main) + range/height vs. angle graph (lower).  
**Formula panel:** R = v²sin(2θ)/g (vacuum), H = v²sin²θ/(2g), time of flight T = 2v sinθ/g.

**1. Optimal Launch Angle (Vacuum)**
Set drag=0, g=9.81, v=30 m/s. Sweep angle from 10° to 80° and watch the range graph. Confirm maximum range at exactly 45°. Verify: R(45°) = v²/g ≈ 91.7 m.

**2. Air Drag Effect**
Fix angle=45°, v=30 m/s. Increase drag from 0 to 0.3. Observe range shrinking and the optimal angle shifting below 45° — with drag, the flat trajectory loses less energy. Record the new optimal angle.

**3. Gravity Scaling**
Set drag=0, angle=45°, v=30 m/s. Compare g=9.81 m/s² (Earth) vs g=1.62 m/s² (Moon) vs g=24.8 m/s² (Jupiter). Range scales as 1/g — verify numerically.

**4. Launch Height Bonus**
Set angle=0° (horizontal launch), v=20 m/s, h=20 m, drag=0. Time of flight t = √(2h/g). Calculate predicted range R = v·t and confirm it matches the simulation.

**5. Symmetric Trajectory**
Set drag=0. Confirm that for any angle θ, the angle (90°−θ) gives the same range. Try θ=30° and θ=60° — ranges should be identical. The trajectory shape differs even though R is equal.

**6. Energy Budget**
Enable the energy readout. At launch all energy is kinetic. At peak height, KE is at its minimum (only horizontal component remains). At landing (same height), KE = initial KE. Verify energy conservation with drag=0.

---

### Simple Harmonic Motion (Mass–Spring)

**Controls:** spring constant k (1–200 N/m), mass m (0.1–10 kg), initial displacement x₀ (−2–2 m), damping b (0–5 N·s/m), driving frequency ω_d (0–20 rad/s), driving amplitude F₀ (0–20 N).  
**Canvases:** animated spring + mass (main) + phase portrait x vs. ẋ (lower).  
**Formula panel:** ω₀ = √(k/m), T = 2π/ω₀, x(t) = A cos(ω₀t + φ), resonance condition ω_d = ω₀.

**1. Period vs. Mass**
Set k=50 N/m, b=0. Measure the period at m=1 kg, m=4 kg, m=9 kg. Period should scale as √m — verify T(4 kg)/T(1 kg) = 2.

**2. Period vs. Spring Constant**
Fix m=1 kg, b=0. Compare k=10, 40, 90 N/m. Period scales as 1/√k. Verify T(10)/T(40) = 2.

**3. Phase Portrait — Undamped Ellipse**
Set b=0. The x–ẋ phase portrait should trace a perfect closed ellipse. Increase x₀ — the ellipse grows but remains closed. This is the hallmark of a conservative system.

**4. Damping Regimes**
Explore: b=0 (undamped), b=2√(km) /2 (underdamped), b=2√(km) (critically damped), b=3√(km) (overdamped). Watch the phase portrait spiral inward, collapse to a line, then creep to origin. Record settling time in each case.

**5. Resonance**
Set b=0.5 N·s/m, k=50 N/m, m=1 kg (ω₀ ≈ 7.07 rad/s), F₀=5 N. Sweep ω_d from 2 to 14 rad/s. Amplitude peaks sharply near ω₀. At exact resonance, amplitude is limited only by damping: A = F₀/(b·ω₀).

**6. Energy Dissipation Rate**
Set b=1, k=50, m=1, x₀=1. The total energy E = ½kx² + ½mv² decays as e^(−bt/m). Measure the half-life from the energy readout and verify: t½ = m·ln2/b.

---

### Pendulum

**Controls:** length L (0.1–5 m), mass m (0.1–5 kg), initial angle θ₀ (1–170°), damping b (0–2), gravity g (1–20 m/s²), driving amplitude A_d (0–5), driving frequency ω_d (0–10 rad/s).  
**Canvases:** animated pendulum with bob trail (main) + θ vs. t and phase portrait (lower).  
**Formula panel:** exact ODE θ̈ = −(g/L)sinθ − (b/m)θ̇ + A_d cos(ω_d t), small-angle T ≈ 2π√(L/g), exact T via elliptic integral.

**1. Small-Angle Period**
Set θ₀=5°, b=0. Measure T from the simulation and compare to 2π√(L/g). Agreement should be within 0.1%. Now try θ₀=45°: measured T will be ~4% longer than the small-angle formula.

**2. Large-Angle Nonlinearity**
Set b=0, L=1 m. Record T at θ₀=5°, 30°, 60°, 90°, 120°, 150°. Plot T vs. θ₀. The small-angle formula underestimates T increasingly at large angles — the true period diverges as θ₀→180°.

**3. Independence of Mass**
Fix L=1 m, θ₀=10°, b=0. Try m=0.1, 1, 5 kg. Period does not change — Galileo's observation. Mass cancels from the equation of motion entirely.

**4. Transition to Chaos (Driven Damped)**
Set L=1 m, g=9.81, b=0.5, A_d=1.2, ω_d=2/3 rad/s (the classic chaotic parameters). The phase portrait fills the whole plane erratically instead of tracing a closed orbit. Tiny changes in θ₀ produce completely different trajectories after ~10 swings.

**5. Gravity Comparison**
Set θ₀=10°, b=0, L=1 m. Compare T on Earth (g=9.81), Moon (g=1.62), Mars (g=3.72), Jupiter (g=24.8). Period scales as 1/√g. This is how pendulum clocks lose time at altitude.

**6. Energy Exchange**
Set b=0, large θ₀. Watch the energy readout: GPE peaks at the turning points (max angle), KE peaks at the bottom. Total energy should remain constant. Enable damping — observe total E decay linearly on a log scale.

---

### Gravitational Orbit

**Controls:** central mass M (0.1–10 × 10²⁴ kg), satellite mass m (negligible), initial radial distance r (0.5–10 AU scaled), initial tangential velocity v_t (0–60 km/s scaled), eccentricity preset buttons (circle, ellipse, parabola, hyperbola).  
**Canvases:** 2D orbit with trail (main) + r vs. t and orbital energy E vs. t (lower).  
**Formula panel:** F = GMm/r², vis-viva v² = GM(2/r − 1/a), T² ∝ a³ (Kepler III), E = −GMm/(2a).

**1. Circular Orbit**
Set v_t to the circular orbit speed v_c = √(GM/r). Orbit should be a perfect circle. Verify with the eccentricity readout (e = 0) and constant r vs. t plot.

**2. Kepler's Third Law**
Create circular orbits at r=1, 2, 4 AU (scaled). Measure the period T from the simulation. Verify T² ∝ r³: T(2r)/T(r) = 2^(3/2) ≈ 2.83.

**3. Elliptical Orbit and Vis-Viva**
Set v_t to 80% of circular speed. An ellipse forms. At periapsis (closest point), record v and r. At apoapsis, record v and r. Verify the vis-viva equation v² = GM(2/r − 1/a) at both points.

**4. Escape Velocity**
Increase v_t to exactly √2 · v_c. The orbit becomes parabolic (e=1) — the satellite barely escapes. Slightly above √2 · v_c: hyperbolic trajectory, E > 0. Slightly below: bound ellipse.

**5. Kepler's Second Law**
Enable the area-sweep overlay. In equal time intervals, the line from focus to satellite sweeps equal areas — regardless of where in the orbit. Verify visually with a slow periapsis pass vs. a slow apoapsis.

**6. Orbital Energy**
Set an elliptical orbit. The total energy E = KE + PE = −GMm/(2a) should be constant throughout (displayed in formula panel). Perturb the initial speed — confirm that increasing E (less negative) enlarges the orbit.

---

### Collision and Momentum

**Controls:** mass m₁, m₂ (0.1–10 kg), initial velocities v₁, v₂ (−20–20 m/s), coefficient of restitution e (0=perfectly inelastic, 1=elastic), ball radius, toggle for 2D vs. 1D mode.  
**Canvases:** animated 2D collision arena (main) + momentum/energy bar chart before and after (lower).  
**Formula panel:** p = mv, J = Δp, e = relative speed after / relative speed before, elastic: v₁' = (m₁−m₂)v₁/(m₁+m₂) + 2m₂v₂/(m₁+m₂).

**1. Elastic Collision — Equal Masses**
Set m₁=m₂=1 kg, e=1, v₁=5 m/s, v₂=0. After collision: v₁'=0, v₂'=5 m/s — the classic "Newton's cradle" result. Total KE and momentum are conserved exactly.

**2. Elastic Collision — Unequal Masses**
Set m₁=3 kg, m₂=1 kg, e=1, v₁=4 m/s, v₂=0. Predict v₁'=(3−1)·4/(3+1)=2 m/s, v₂'=2·3·4/(3+1)=6 m/s. Verify against simulation. Note: heavy ball barely slows; light ball shoots forward fast.

**3. Perfectly Inelastic**
Set e=0 (balls stick together). Any initial conditions: after collision both move at v_cm = (m₁v₁+m₂v₂)/(m₁+m₂). KE loss = ½μ(v₁−v₂)² where μ = m₁m₂/(m₁+m₂) is the reduced mass. Verify the KE loss bar in the graph.

**4. Coefficient of Restitution Sweep**
Fix m₁=m₂=1 kg, v₁=5 m/s, v₂=0. Sweep e from 0 to 1 in steps of 0.2. Observe the KE loss decreasing toward zero as e→1. The lost KE goes into deformation/heat.

**5. Center-of-Mass Frame**
Enable the CM velocity overlay. In the CM frame, all collisions are symmetric: the balls approach and recede at the same speed (scaled by e). Verify that CM velocity is identical before and after for all values of e.

**6. 2D Glancing Collision**
Switch to 2D mode. Set an off-center impact (adjust impact parameter). Observe the deflection angles. Verify that both x and y components of total momentum are conserved separately, even though the individual velocities change direction.

---

### Rotational Motion (Rigid Body)

**Controls:** moment of inertia I (0.01–10 kg·m²), applied torque τ (−20–20 N·m), initial angular velocity ω₀ (−10–10 rad/s), rotational damping b (0–2 N·m·s), toggle for angular momentum readout.  
**Canvases:** rotating disk/bar with angle marker (main) + ω vs. t and angular KE vs. t (lower).  
**Formula panel:** τ = Iα, α = τ/I, ω(t) = ω₀ + αt, θ(t) = ω₀t + ½αt², KE = ½Iω².

**1. Angular Acceleration**
Set I=2 kg·m², τ=4 N·m, ω₀=0, b=0. The disk should accelerate at α = τ/I = 2 rad/s². Measure ω after t=3 s: expect ω=6 rad/s. Verify with the readout.

**2. Rotational Inertia Scaling**
Fix τ=4 N·m, ω₀=0, b=0. Double I from 1 to 2 kg·m². Time to reach ω=10 rad/s doubles (α halves). This is the rotational analogue of F=ma: larger I means harder to spin up.

**3. Braking Torque**
Spin the disk to ω=10 rad/s, then apply τ=−5 N·m (opposing). Measure stopping time. Verify: t = Iω/τ. Try different I and τ combinations — the product I·ω (angular momentum L) controls stopping time.

**4. Rotational Damping**
Set b>0, τ=0, initial ω=10 rad/s. Angular velocity decays exponentially: ω(t) = ω₀ e^(−bt/I). Measure the time constant τ_damp = I/b and compare to simulation.

**5. Angular Kinetic Energy**
Set τ=0, b=0. Total KE = ½Iω² should remain constant forever. Apply a brief impulse torque, then remove it — KE jumps to a new constant level. Verify that energy added equals the work done by the torque (W = τ·Δθ).

**6. Moment of Inertia — Shape Presets**
Use the shape selector: solid disk (I = ½MR²), ring (I = MR²), rod through center (I = ML²/12), rod through end (I = ML²/3). With equal M and equal τ, confirm the ring accelerates slowest (highest I) and the disk through center fastest.

---

## Electricity & Magnetism

> **Implementation pattern:** field-line rendering via 4th-order Runge-Kutta streamline integration from seed points around each charge. Per-pixel potential map: iterate over every pixel, compute V = Σ kq/r, map to hue. Force vectors computed analytically. Canvas 2D with `putImageData` for the potential map (inner loop), then vector overlay on top.

### Electric Field & Potential (Point Charges)

**Controls:** up to 6 charges, each with position (drag on canvas) and charge q (−10–+10 μC). Toggle for: field lines, equipotential contours, force vectors, potential heat map.  
**Canvases:** 2D field visualization (main) + potential vs. distance along a user-drawn line (lower).  
**Formula panel:** E = kq/r², V = kq/r, F = qE, superposition principle.

**1. Single Positive Charge**
Place one +q charge. Field lines radiate outward uniformly. Equipotentials are perfect circles. Verify: E at distance r doubles when r halves (inverse-square law) using the readout.

**2. Electric Dipole**
Place +q and −q separated by 2 cm. Observe the characteristic dipole field: lines leave +q and curve into −q. Along the perpendicular bisector, E points from + to − and V = 0. Confirm V=0 on the bisector.

**3. Two Like Charges**
Place +q and +q. A saddle point (E=0) appears on the midpoint. Field lines never cross. Verify the null point: E = 0 exactly at the midpoint due to equal and opposite contributions.

**4. Potential Landscape**
Switch to the potential heat map. For a single +q, the map should show a sharp bright peak (high V) decaying as 1/r. Drag the charge — the map updates instantly. For +q and −q, find the zero-potential surface.

**5. Superposition Check**
Place three charges in a triangle. Pick a test point. Read the total E from the simulation. Calculate it manually by vector-adding E₁, E₂, E₃ from each charge. Verify the simulation matches (within rounding).

**6. Work Done Moving a Charge**
Note V at two points A and B in a static field. Moving a +1 μC test charge from A to B requires work W = q(V_A − V_B). Set A at r=1 cm from a +5 μC charge and B at r=3 cm. Compute and verify.

---

### Magnetic Force on a Moving Charge

**Controls:** charge q (−5–+5 μC), mass m (1e-27–1e-25 kg), initial velocity v (magnitude 1e4–1e7 m/s, direction angle), magnetic field B (0.001–2 T, perpendicular to screen), electric field E (0–1e6 V/m, x or y direction), toggle for trail, force vector, radius circle.  
**Canvases:** 2D particle trajectory (main) + KE and radius vs. t (lower).  
**Formula panel:** F = q(E + v×B), r = mv/(|q|B), ω_c = |q|B/m (cyclotron frequency), T = 2πm/(|q|B).

**1. Circular Motion in B Field**
Set E=0, B=0.1 T, v=1e5 m/s. The particle traces a perfect circle. Measure radius from canvas and verify r = mv/(qB). Change v — radius scales linearly. Change B — radius scales as 1/B.

**2. Cyclotron Period Independence**
Vary v from 1e4 to 1e6 m/s with E=0, fixed B. The orbital period T = 2πm/(qB) should not change — this is the isochronous property that makes cyclotrons work.

**3. E×B Drift**
Set B perpendicular (out of screen), E in the x-direction. The particle drifts in the y-direction at v_drift = E/B, regardless of sign of charge. Verify: both +q and −q drift in the same direction.

**4. Charge Sign**
Swap q from +2 μC to −2 μC, same initial velocity. The circle reverses handedness (clockwise vs. counter-clockwise). The radius is identical; only the sense of rotation flips.

**5. Mass Spectrometer**
Set E=0. Two particles with same q but masses m and 2m enter at the same speed. After a half-circle, the heavier particle lands at 2× the radius. This is the principle of magnetic mass separation.

**6. Velocity Selector**
Tune E and B so that qE = qvB → v = E/B. Only particles with exactly that speed travel straight. Verify: set E=1e5 V/m, B=0.1 T → v_select = 1e6 m/s. Particles faster or slower curve in opposite directions.

---

### RC / RL / LC Circuits

**Controls:** resistance R (1–10000 Ω), capacitance C (1 μF–10 mF), inductance L (1 mH–1 H), source voltage V₀ (1–100 V), circuit type selector (RC charge, RC discharge, RL, LC, RLC), initial conditions.  
**Canvases:** animated circuit schematic with current arrow (main) + V_C or I vs. t graph (lower).  
**Formula panel:** τ_RC = RC, τ_RL = L/R, ω₀ = 1/√(LC), ζ = R/(2)√(C/L) (damping ratio), Q factor.

**1. RC Charging Time Constant**
Set R=1000 Ω, C=1 mF, V₀=10 V. After t=RC=1 s, V_C should reach 63.2% of V₀ (= 6.32 V). After t=5RC, V_C ≈ 99.3% V₀. Verify from the graph.

**2. RC Discharge**
Charge the capacitor fully, then switch to discharge mode (remove source). V_C decays as V₀ e^(−t/RC). Measure the half-life: t½ = RC·ln2 ≈ 0.693·RC. Confirm numerically.

**3. RL Time Constant**
Set R=100 Ω, L=100 mH (τ = L/R = 1 ms), V₀=10 V. Current rises as I(t) = (V₀/R)(1 − e^(−Rt/L)). At t=τ, I should reach 63.2% of V₀/R. Verify from graph.

**4. LC Oscillation**
Set R=0, L=100 mH, C=1 mF. Natural frequency ω₀ = 1/√(LC) ≈ 100 rad/s → f₀ ≈ 15.9 Hz. Start with V_C=10 V, I=0. Observe sinusoidal oscillation. Measure period and verify T = 2π√(LC).

**5. RLC Damping Regimes**
Fix L=100 mH, C=1 mF (ω₀=100 rad/s). Vary R: underdamped (R < 2√(L/C) = 20 Ω), critically damped (R = 20 Ω), overdamped (R > 20 Ω). Observe the transition from oscillatory to exponential decay.

**6. Resonance and Q Factor**
Drive the RLC circuit with an AC source. Sweep frequency ω_d from 0.1ω₀ to 10ω₀. The current peaks sharply at ω₀. The sharpness is quantified by Q = ω₀L/R = (1/R)√(L/C). High Q = narrow peak.

---

### Faraday's Law / Electromagnetic Induction

**Controls:** number of coil turns N (1–500), coil area A (1–100 cm²), magnetic field B(t) profile (constant, sinusoidal, triangular, step), field amplitude B₀ (0.01–2 T), field frequency f (0.1–100 Hz), external resistance R (1–1000 Ω).  
**Canvases:** animated coil in field with flux lines (main) + Φ(t), ε(t), and I(t) graphs (lower).  
**Formula panel:** Φ = NBAcosθ, ε = −dΦ/dt, I = ε/R, P = ε²/R = I²R.

**1. EMF vs. Rate of Change**
Set B(t) = sinusoidal, B₀=0.5 T, f=1 Hz, N=100, A=50 cm². The EMF ε = −NAdB/dt = −NAB₀ω cos(ωt). Peak EMF = NAB₀ω ≈ 0.157 V. Verify against the graph.

**2. Turns Number Scaling**
Fix B₀, f, A. Double N from 100 to 200. Peak EMF doubles — ε ∝ N. This is the transformer principle: more turns = higher voltage.

**3. Lenz's Law**
Use a step-change B(t) (sudden increase). The induced EMF opposes the change — the induced current creates a B field opposing the external increase. Observe the sign of ε in the graph: it is negative when dB/dt > 0.

**4. Triangular vs. Sinusoidal B**
Compare a triangular B(t) (constant dB/dt in each half-period) with sinusoidal. With triangular, ε = −NA·(dB/dt) = constant between kinks — a square wave. With sinusoidal B, ε is also sinusoidal but 90° out of phase.

**5. Power Dissipation**
Set N=200, A=100 cm², B₀=1 T, f=10 Hz, R=10 Ω. Peak ε = NAB₀ω ≈ 12.6 V, peak I ≈ 1.26 A, average power P = ε²_rms/R = (ε_peak/√2)²/R ≈ 7.9 W. Verify from the power readout.

**6. Generator Rotation**
Switch to rotating coil mode: B constant, coil rotates at ω rad/s. Φ = NBAcos(ωt), ε = NBAω sin(ωt). Vary rotation speed — peak EMF scales linearly with ω. This is an AC generator.

---

## Thermodynamics

> **Implementation pattern:** N-particle 2D hard-sphere gas in a rectangular box. Each particle has position (x,y) and velocity (vx,vy). Time-stepped with elastic wall and particle-particle collisions. Per-frame: compute speed histogram, mean KE (→ temperature), pressure (impulse on walls per unit time per unit length). Canvas 2D `clearRect` + `fillRect` per particle each frame (~300 particles at 60 fps is feasible).

### Ideal Gas (Maxwell–Boltzmann Distribution)

**Controls:** number of particles N (10–500), temperature T (100–2000 K), box width W and height H (resizable), particle mass m (1–100 amu), toggle for: velocity vectors, speed histogram, collision counter.  
**Canvases:** particle swarm (main) + live Maxwell–Boltzmann speed distribution histogram (lower).  
**Formula panel:** PV = NkT, ⟨KE⟩ = ½kT per degree of freedom, v_rms = √(3kT/m), v_mp = √(2kT/m), v_avg = √(8kT/πm).

**1. Temperature and Speed Distribution**
Set N=200, m=28 amu (nitrogen), vary T from 200 K to 1600 K. Watch the histogram broaden and shift right. The most probable speed v_mp = √(2kT/m) should match the histogram peak. Verify at T=300 K: v_mp ≈ 422 m/s.

**2. Pressure vs. Temperature (Charles's Law)**
Fix N, box volume V. Increase T — pressure readout should increase proportionally (P ∝ T at constant V). Double T from 300 K to 600 K: P should double. This is Gay-Lussac's Law.

**3. Pressure vs. Volume (Boyle's Law)**
Fix N, T. Shrink the box width. Pressure should increase as 1/V (P ∝ 1/V at constant T). Plot P vs. V: should be a hyperbola. Verify PV = constant numerically.

**4. Heavy vs. Light Particles**
Set T=300 K. Compare m=2 amu (hydrogen) vs m=32 amu (oxygen) vs m=131 amu (xenon). Heavier particles move slower — v_rms ∝ 1/√m. Verify: v_rms(H₂)/v_rms(Xe) = √(131/2) ≈ 8.1.

**5. Equipartition**
Read the mean KE per particle from the formula panel. At any T and any m, ⟨KE⟩ = (3/2)kT (3D) or kT (2D, two translational degrees of freedom). Verify the readout equals kT regardless of particle mass.

**6. Approach to Equilibrium**
Start all particles with identical speed (delta distribution). Watch the histogram evolve into a Maxwell–Boltzmann shape as collisions redistribute energy. Count how many collision events are needed for the histogram to converge.

---

### Carnot Engine

**Controls:** hot reservoir T_H (400–1200 K), cold reservoir T_C (200–600 K, must be < T_H), working substance amount n (1–5 mol), volume ratio V_max/V_min (2–20), cycle speed (0.1–3×).  
**Canvases:** animated P–V diagram with cycle trace (main) + T–S diagram and power output vs. cycle number (lower).  
**Formula panel:** η_Carnot = 1 − T_C/T_H, W = nR(T_H−T_C)ln(V_max/V_min), Q_H = nRT_H·ln(V_max/V_min), η = W/Q_H.

**1. Carnot Efficiency**
Set T_H=800 K, T_C=300 K. Predicted η = 1−300/800 = 62.5%. Read the displayed efficiency and verify. Note: no real heat engine can exceed this value.

**2. Temperature Difference Scaling**
Fix T_C=300 K. Vary T_H from 400 K to 1200 K. Plot efficiency: η = 1−300/T_H → approaches 100% as T_H→∞, but never reaches it. At T_H=600 K: η=50%.

**3. Ideal vs. Real Efficiency**
The Carnot cycle is reversible (maximum efficiency). Add a small irreversibility parameter (simulate a finite-time Curzon–Ahlborn engine): η_CA = 1 − √(T_C/T_H). Compare η_Carnot vs. η_CA. The CA value is always lower.

**4. Work Output vs. Volume Ratio**
Fix T_H=800 K, T_C=300 K. Vary V_max/V_min from 2 to 20. Work W = nR(T_H−T_C)ln(r) increases logarithmically. Doubling the ratio adds the same ΔW each time — a diminishing return.

**5. P–V Diagram Identification**
Watch the animated P–V trace. Identify the four strokes: (1) isothermal expansion at T_H (curved, top), (2) adiabatic expansion (steep curve, top-right to bottom-right), (3) isothermal compression at T_C (curved, bottom), (4) adiabatic compression (steep, bottom-left to top-left).

**6. Entropy — T–S Diagram**
Switch to the T–S panel. The Carnot cycle traces a perfect rectangle: isothermal strokes are horizontal lines (constant T, ΔS = Q/T), adiabatic strokes are vertical lines (ΔS = 0). Area of rectangle = W (net work done).

---

### Heat Conduction (Fourier's Law)

**Controls:** material thermal conductivity κ (0.01–400 W/m·K), bar length L (0.1–2 m), cross-section area A (1–100 cm²), left boundary T_L (0–1000°C), right boundary T_R (0–1000°C), initial temperature distribution (uniform, spike, step), toggle for: steady-state overlay, heat flux arrows.  
**Canvases:** color-mapped temperature along bar, animated heat flow (main) + T(x,t) line profiles and dT/dt at center (lower).  
**Formula panel:** q = −κ·dT/dx, Q = κA(T_L−T_R)/L (steady state), diffusion equation ∂T/∂t = α·∂²T/∂x², thermal diffusivity α = κ/(ρc).

**1. Steady-State Profile**
Set fixed boundary temperatures T_L=100°C, T_R=0°C, κ=any, wait for steady state. Temperature profile should be exactly linear: T(x) = T_L − (T_L−T_R)·x/L. Verify by toggling the steady-state overlay line.

**2. Fourier's Law — Conductivity**
In steady state, heat flux q = κ(T_L−T_R)/L. Fix ΔT=100°C, L=1 m. Compare κ=1 W/m·K (wood-like) vs κ=400 W/m·K (copper-like). Flux scales linearly with κ — copper conducts 400× more heat.

**3. Diffusion Speed**
Set a temperature spike at center, boundaries at 0°C. The spike spreads and decays as a Gaussian: σ(t) = √(2αt). Measure the half-width at half-max at t=1 s, 4 s, 9 s — widths should be in ratio 1:2:3 (∝ √t).

**4. Boundary Temperature Ratio**
With κ=50 W/m·K, L=1 m, A=10 cm². Double ΔT from 50°C to 100°C. Heat flux Q doubles (Q ∝ ΔT). Halve L from 1 m to 0.5 m with same ΔT — Q doubles again (Q ∝ 1/L).

**5. Material Comparison**
Use preset material buttons: air (κ=0.025), wood (κ=0.15), glass (κ=1.0), steel (κ=50), copper (κ=400). Same boundary conditions. Compare time to reach steady state: higher α = faster diffusion. Steel reaches steady state ~320× faster than wood.

**6. Insulated Boundary**
Set the right boundary to "insulated" (dT/dx=0 at x=L). The steady-state profile becomes constant — all of T_L everywhere. Starting from T=0, observe the temperature wave propagate in from the left and eventually fill the bar uniformly.

---

## Quantum Mechanics

> **Implementation pattern:** 1D TDSE solver using Crank–Nicolson finite-difference scheme on a spatial grid of 512–1024 points. At each timestep: build the tridiagonal matrix (1 + i·dt·H/2)|ψ⁽ⁿ⁺¹⟩ = (1 − i·dt·H/2)|ψⁿ⟩, solve with Thomas algorithm. Store ψ as two Float64Arrays (real, imag). Render |ψ|² as a filled curve. Expectation values ⟨x⟩, ⟨p⟩, ⟨E⟩ computed via numerical integration each frame.

### Particle in a Box (Infinite Square Well)

**Controls:** box width L (0.1–5 nm), particle mass m (0.1–10 m_e), energy level n (1–10), superposition of two levels (n₁, n₂ with amplitude ratio), toggle for: |ψ|², Re(ψ), Im(ψ), probability current J, energy levels.  
**Canvases:** wavefunction in box with energy levels (main) + |ψ|² probability density and ⟨x⟩ vs. t (lower).  
**Formula panel:** E_n = n²π²ℏ²/(2mL²), ψ_n = √(2/L)·sin(nπx/L), Δx·Δp ≥ ℏ/2.

**1. Energy Level Spacing**
Set L=1 nm, m=m_e. Compute E₁ = π²ℏ²/(2mL²) ≈ 0.376 eV. Check E₂ = 4E₁ ≈ 1.504 eV, E₃ = 9E₁. Verify the n² scaling by reading the energy panel.

**2. Box Size and Confinement Energy**
Fix n=1. Compare E₁ at L=0.5 nm vs L=1 nm vs L=2 nm. E₁ ∝ 1/L² — halving L quadruples the ground state energy. This is the quantum confinement effect (basis of quantum dots).

**3. Probability Density Nodes**
Step through n=1 to n=8. Count the nodes in |ψ|²: state n has (n−1) interior nodes. Toggle between Re(ψ) and |ψ|² — the real part oscillates at E_n/ℏ, but |ψ|² for a pure stationary state is time-independent.

**4. Superposition and Quantum Beats**
Mix n=1 and n=2 (equal amplitudes). The probability density oscillates at the beat frequency f = (E₂−E₁)/h. Measure the oscillation period from the ⟨x⟩ vs. t plot. Verify: T_beat = h/(E₂−E₁).

**5. Heisenberg Uncertainty**
For state n, the uncertainty product Δx·Δp is computed from the wavefunction. Compare n=1 (ground state) vs n=5. Higher n states have larger Δp (more momentum uncertainty). The uncertainty product always satisfies Δx·Δp ≥ ℏ/2.

**6. Heavy Particle**
Fix L=1 nm, n=1. Increase mass from m_e to 10 m_e to 1000 m_e (approaching classical). Ground state energy E₁ ∝ 1/m → decreases; the wavefunction looks "flatter." In the classical limit (m→∞), the particle is equally likely anywhere — uniform probability density.

---

### Quantum Harmonic Oscillator

**Controls:** angular frequency ω (1e12–1e15 rad/s), mass m (0.1–10 m_e), quantum number n (0–10), superposition toggle (n and n+1), coherent state option (α parameter 0–5), toggle for: potential well overlay, energy level lines, classical turning points.  
**Canvases:** wavefunction with parabolic potential (main) + ⟨x⟩(t) and ⟨E⟩ readout (lower).  
**Formula panel:** E_n = (n+½)ℏω, ψ_n ∝ H_n(x/x₀)·e^(−x²/2x₀²) where x₀ = √(ℏ/mω), zero-point energy E₀ = ½ℏω.

**1. Zero-Point Energy**
Set n=0. Energy E₀ = ½ℏω > 0 — the ground state has nonzero energy even at absolute zero. There is no state with E=0 (the wavefunction would violate the uncertainty principle). Verify the E₀ readout matches ½ℏω.

**2. Equally Spaced Levels**
Step through n=0 to n=8. Unlike the particle in a box (E ∝ n²), all levels are equally spaced: ΔE = ℏω. Verify: E₅ − E₄ = E₁ − E₀ = ℏω. This equal spacing gives rise to the Planck blackbody formula.

**3. Tunneling Beyond Classical Turning Points**
For state n, the classical turning points are at x = ±√(2E_n/mω²) = ±x₀√(2n+1). Observe that |ψ|² is nonzero beyond these points — classically forbidden, quantum mechanically allowed. The tunneling probability increases with n.

**4. Coherent State**
Enable the coherent state with α=2. This is a Gaussian wavepacket that oscillates back and forth at frequency ω without spreading — it mimics a classical oscillator. Watch ⟨x⟩(t) = x₀·2|α|·cos(ωt).

**5. Node Count**
State ψ_n has exactly n nodes (zero crossings) in the wavefunction. Verify for n=0 through n=6. The nodes push the wavefunction outward at higher n — it reaches further into the classically forbidden region.

**6. Frequency Dependence**
Fix n=0 (ground state). Vary ω by a factor of 4 (quadruple the frequency). The zero-point energy E₀ = ½ℏω doubles, and the spatial extent x₀ = √(ℏ/mω) halves (narrower wavepacket). Stiffer spring → higher ω → smaller zero-point spread.

---

### Quantum Tunneling

**Controls:** particle energy E (0.1–10 eV), barrier height V₀ (0.5–15 eV), barrier width d (0.05–2 nm), particle mass m (0.1–10 m_e), wavepacket width σ (0.2–2 nm), toggle for: incident/reflected/transmitted labels, transmission coefficient T display, log-scale T.  
**Canvases:** animated wavepacket approaching and tunneling through barrier (main) + T vs. E graph and T vs. d graph (lower).  
**Formula panel:** T = [1 + (V₀²sinh²(κd))/(4E(V₀−E))]⁻¹, κ = √(2m(V₀−E))/ℏ, T ≈ e^(−2κd) for thick barriers.

**1. Transmission vs. Energy**
Set V₀=5 eV, d=0.5 nm. Sweep E from 0.1 eV to 4.9 eV. At low E, T is exponentially small. As E→V₀, T increases steeply. For E > V₀ (above barrier), T < 1 due to wave reflection — verify the T graph shows this.

**2. Exponential Thickness Dependence**
Fix E=2 eV, V₀=5 eV. Vary d from 0.1 nm to 1.0 nm. T ≈ e^(−2κd) — plot ln(T) vs. d: should be a straight line. Measure slope = −2κ and verify κ = √(2m(V₀−E))/ℏ.

**3. Mass Dependence**
Fix E=2 eV, V₀=5 eV, d=0.5 nm. Compare m=m_e (electron) vs m=2m_e vs m=4m_e. Since κ ∝ √m, doubling the mass increases κ by √2, dramatically reducing T. This is why protons tunnel far less than electrons.

**4. Resonance Tunneling**
Set E > V₀ (e.g. V₀=2 eV, E=3 eV). Observe that T < 1 even above the barrier due to wave reflection at the interfaces. At specific E values, T = 1 exactly (perfect transmission) — a resonance condition analogous to Fabry-Perot in optics.

**5. STM Sensitivity**
In scanning tunneling microscopy, T ≈ e^(−2κd). With κ ≈ 10 nm⁻¹, changing d by 0.1 nm changes T by e^(−2) ≈ 7.4× (740%). This extreme sensitivity to distance is why STM can image individual atoms. Verify with the d sweep.

**6. Classical Limit**
Increase barrier height V₀ to 15 eV, keeping E=1 eV. T becomes vanishingly small (~10⁻³⁰). Classically, T=0. This is the classical limit: the barrier is impenetrable to a particle without sufficient energy.

---

### Wave–Particle Duality (de Broglie)

**Controls:** particle type selector (electron, proton, neutron, C60, baseball), particle speed v (0.01c–0.99c for light particles, 0.001–100 m/s for macroscopic), double-slit separation d (0.1–10 nm for particles, 0.01–10 mm for macroscopic), slit width a (0.05–5 nm).  
**Canvases:** particle-by-particle buildup of interference pattern (main, dot accumulation) + |ψ|² overlay and hit histogram (right panel).  
**Formula panel:** λ_dB = h/(mv) (non-relativistic), λ_dB = h/(γmv) (relativistic), fringe spacing β = λ_dB·L/d.

**1. de Broglie Wavelength**
Set particle=electron, v=1e6 m/s. λ_dB = h/(m_e·v) ≈ 0.73 nm — comparable to atomic spacings. Verify against formula panel. Now set particle=baseball (m=0.145 kg), v=30 m/s: λ_dB ≈ 1.5×10⁻³⁴ m — completely unobservable.

**2. Pattern Buildup**
Watch particles arrive one by one. At first, hits appear random. After ~100 particles, the interference pattern begins to emerge. After ~5000, it matches |ψ|² exactly. Each particle "interferes with itself" — it passed through both slits simultaneously.

**3. Heavier Particles = Shorter Wavelength**
Compare electron, proton, neutron at the same kinetic energy KE=100 eV. λ_dB = h/√(2mKE) ∝ 1/√m. Proton has λ ≈ 1/43 of electron. Observe the much finer fringe pattern for the proton.

**4. Relativistic Correction**
For electron at v=0.9c: γ = 1/√(1−v²/c²) ≈ 2.29. Relativistic λ = h/(γm_e·v) ≈ 1.2 pm. Non-relativistic formula gives λ = h/(m_e·v) ≈ 2.7 pm — a factor of ~2.3 error. Toggle the relativistic correction to see the difference.

**5. "Which Path" Information**
Enable the "detector" toggle — place a which-path detector at one slit. The interference pattern immediately disappears and you see only a sum of two single-slit patterns. This is wave-particle complementarity: obtaining path information destroys the interference.

**6. Macroscopic Object**
Select C60 (buckminsterfullerene, m≈1.2×10⁻²⁴ kg). At thermal speed v≈200 m/s, λ_dB ≈ 2.8 pm. Set d=100 nm: fringe spacing β = λL/d ≈ 14 μm — extremely fine but observable. This experiment was performed in Vienna in 1999 — the largest object ever to show quantum interference.

---

## Fluid Dynamics

> **Implementation pattern:** 2D Eulerian grid (128×128 cells). Navier–Stokes solver: advection (semi-Lagrangian backtracking), pressure projection (Jacobi or Gauss-Seidel iteration, 20–40 iterations per frame), viscosity (explicit diffusion step). Velocity field stored as two Float32Arrays (u, v). Density/dye field advected passively. Per-pixel rendering of density field via `putImageData`. Streamlines and vorticity overlay drawn on top.

### Viscous Flow (Navier–Stokes)

**Controls:** viscosity ν (0.0001–0.1 m²/s), inflow velocity U (0.1–5 m/s), obstacle shape (none, circle, square, airfoil), obstacle size (5–30% of domain), dye injection toggle, streamline toggle, vorticity heatmap toggle, Reynolds number readout.  
**Canvases:** 2D flow field with dye/streamlines (main, full width) + velocity profile at mid-cross-section and vorticity magnitude vs. x (lower strip).  
**Formula panel:** Re = UL/ν, ∇·u = 0 (incompressibility), Navier–Stokes: ∂u/∂t + (u·∇)u = −∇p/ρ + ν∇²u.

**1. Laminar vs. Turbulent**
Set obstacle=circle, L=0.1 m (circle diameter). Increase U from 0.01 m/s to 1 m/s while keeping ν=0.01. Reynolds number Re = UL/ν rises from 0.1 to 10. At Re < 1: smooth laminar flow around circle. At Re ≈ 40: symmetric wake vortices appear. At Re > 100: vortex shedding begins (Kármán street).

**2. Kármán Vortex Street**
Set Re ≈ 150 (tune U and ν). Alternating vortices shed from each side of the obstacle — the classic Kármán vortex street. Enable vorticity heatmap: alternating red/blue patches behind the obstacle. Measure shedding frequency: f = St·U/L where Strouhal number St ≈ 0.2.

**3. Viscosity Effect**
Fix U=1 m/s, obstacle=circle. Compare ν=0.1 (Re=10, laminar) vs ν=0.005 (Re=200, unsteady) vs ν=0.001 (Re=1000, chaotic). Higher Re → less viscous damping → more complex, unsteady flow.

**4. Pressure Distribution**
Enable the pressure overlay. Flow must accelerate around the obstacle (continuity) — the narrowed channel creates low pressure by Bernoulli: p + ½ρv² = const. High pressure at the stagnation point (front), low pressure at the sides.

**5. Streamlines vs. Pathlines**
Inject a steady stream of dye from the left. At low Re, dye streaklines, pathlines, and streamlines all coincide (steady flow). At high Re (unsteady), dye streaks diverge from the instantaneous streamlines — observe the difference between these two flow representations.

**6. Airfoil Lift**
Switch obstacle to "airfoil" shape, set angle of attack (0°, 5°, 10°, 15°). At 0°: symmetric flow, no lift. At 5°–10°: asymmetric circulation, higher pressure below and lower above → net upward force (lift). At 15°+: flow separates from top surface (stall) — lift drops suddenly.

---

### Bernoulli's Principle / Pipe Flow

**Controls:** inlet pressure P₁ (1000–100000 Pa gauge), pipe radius r₁ (1–10 cm), constriction ratio r₂/r₁ (0.1–1.0), fluid density ρ (500–2000 kg/m³), viscosity ν (0.0001–0.1 m²/s), pipe length L (0.5–5 m), toggle for: pressure color map, velocity vectors, Bernoulli verification readout.  
**Canvases:** longitudinal pipe cross-section with animated flow particles (main) + pressure vs. x and velocity vs. x profiles (lower).  
**Formula panel:** A₁v₁ = A₂v₂ (continuity), P + ½ρv² + ρgh = const (Bernoulli), ΔP_Venturi = ½ρ(v₂²−v₁²), Poiseuille: Q = πr⁴ΔP/(8ηL).

**1. Continuity Equation**
Set r₁=5 cm, r₂=2.5 cm (ratio 0.5). The cross-section area halves: A₂ = A₁/4. By continuity, v₂ = 4v₁. Verify from the velocity profile graph: velocity at constriction is 4× the inlet velocity.

**2. Bernoulli Pressure Drop**
At the constriction, v₂ = 4v₁, so pressure drops: ΔP = ½ρ(v₂²−v₁²) = ½ρ·15v₁². Set ρ=1000 kg/m³, v₁=1 m/s: ΔP = 7500 Pa. Verify from the pressure profile graph. This is the Venturi effect.

**3. Density Effect**
Fix geometry (r₁=5 cm, r₂=2 cm), P₁=10000 Pa. Compare ρ=800 kg/m³ (oil) vs ρ=1000 kg/m³ (water) vs ρ=1800 kg/m³ (brine). Higher density fluid moves slower through the constriction (same pressure → lower kinetic energy per unit volume per unit mass).

**4. Viscous Poiseuille Flow**
Set r₁=r₂ (no constriction — straight pipe). Increase ν. The parabolic Poiseuille velocity profile develops: v(r) = v_max(1−r²/R²). Measure v_max at center and v=0 at wall. Flow rate Q = πR²v_max/2. Verify Q ∝ r⁴ (Hagen–Poiseuille law) by halving r.

**5. Lift Analogy (Venturi Lift)**
Set the pipe with a curved upper wall (venturi top) vs flat lower wall. Faster flow over the curved top creates lower pressure above than below — a net upward force. This is the same mechanism as airfoil lift, but in a controlled pipe geometry.

**6. Turbulence Onset**
Increase flow rate (P₁) while keeping geometry fixed. Monitor the Reynolds number Re = v·r/ν. Below Re ≈ 2300: laminar Poiseuille profile (smooth, parabolic). Above Re ≈ 4000: turbulent profile (flatter core, sharp boundary layer). Observe the transition in the velocity profile.

---

## Summary

| Simulator | Category | Experiments |
|---|---|---|
| Young's Double-Slit | Wave Optics | 6 |
| Single-Slit Diffraction | Wave Optics | 6 |
| Diffraction Grating | Wave Optics | 6 |
| Thin-Film Interference | Wave Optics | 6 |
| Standing Waves on a String | Waves | 6 |
| Doppler Effect | Waves | 6 |
| Projectile Motion | Classical Mechanics | 6 |
| Simple Harmonic Motion | Classical Mechanics | 6 |
| Pendulum | Classical Mechanics | 6 |
| Gravitational Orbit | Classical Mechanics | 6 |
| Collision and Momentum | Classical Mechanics | 6 |
| Rotational Motion | Classical Mechanics | 6 |
| Electric Field & Potential | Electricity & Magnetism | 6 |
| Magnetic Force on a Charge | Electricity & Magnetism | 6 |
| RC / RL / LC Circuits | Electricity & Magnetism | 6 |
| Faraday's Law / Induction | Electricity & Magnetism | 6 |
| Ideal Gas (Maxwell–Boltzmann) | Thermodynamics | 6 |
| Carnot Engine | Thermodynamics | 6 |
| Heat Conduction | Thermodynamics | 6 |
| Particle in a Box | Quantum Mechanics | 6 |
| Quantum Harmonic Oscillator | Quantum Mechanics | 6 |
| Quantum Tunneling | Quantum Mechanics | 6 |
| Wave–Particle Duality | Quantum Mechanics | 6 |
| Viscous Flow (Navier–Stokes) | Fluid Dynamics | 6 |
| Bernoulli / Pipe Flow | Fluid Dynamics | 6 |
| **Total** | | **150** |
