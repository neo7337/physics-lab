# Double-Slit Experiment Simulator

An interactive browser-based simulation of **Young's Double-Slit Experiment**. Visualizes wave interference in real time with exact physics — no small-angle approximations, no dependencies.

[Open `index.html`](index.html) in any modern browser to run it. No build step or server required.

## Features

- **Real-time wave field** — per-pixel animated wavefronts from two point sources (Huygens' principle) with 2D cylindrical amplitude decay ($1/\sqrt{r}$)
- **Exact intensity formula** — $I = A^2 \cos^2\!\left(\frac{\pi d \sin\theta}{\lambda}\right) \cdot \mathrm{sinc}^2\!\left(\frac{\pi a \sin\theta}{\lambda}\right)$, including the single-slit envelope
- **Intensity graph** — plots fringe intensity vs. screen position with wavelength-accurate color and fringe-order tick marks
- **Live formula panel** — shows path difference $\Delta$, fringe spacing $\beta = \lambda L / d$, and a fringe position table ($m = -3$ to $+3$) updated on every slider change
- **Wavelength-to-color** — visible spectrum (380–750 nm) converted to RGB with UV/far-red rolloff
- **Docs page** ([`docs.html`](docs.html)) — full physics derivations, historical timeline, interactive diagrams, and guided experiments

## Controls

| Parameter | Range | Default | Effect |
|---|---|---|---|
| Wavelength (λ) | 380–750 nm | 550 nm | Fringe color and spacing |
| Slit separation (d) | 0.1–5 mm | 1.0 mm | Fringe density ($\beta = \lambda L / d$) |
| Slit width (a) | 0.01–0.5 mm | 0.10 mm | Single-slit envelope width; missing orders when $a \approx d/N$ |
| Screen distance (L) | 0.1–2.0 m | 1.0 m | Fringe spacing |
| Intensity (A) | 0.1–2.0 | 1.0 | Overall brightness ($I \propto A^2$) |
| Animation speed | 0.1×–3× | 1× | Wavefront animation rate |
| Animate waves | toggle | on | Pause/resume animation |
| Fringe labels | toggle | on | Show/hide order labels ($m = 0, \pm1, \pm2, \ldots$) |

## Files

```
index.html   — simulator
main.js      — physics, rendering, controls
style.css    — dark-theme UI
docs.html    — companion explainer with derivations and experiments
```

## Physics

- Uses $\sin\theta = y / \sqrt{y^2 + L^2}$ — exact geometry, no small-angle approximation
- Constructive fringes at $d \sin\theta = m\lambda$
- Destructive fringes at $d \sin\theta = (m + \tfrac{1}{2})\lambda$
- Missing orders when slit width $a$ satisfies $a/d = 1/N$

## Usage

```
git clone <repo>
# then open index.html in a browser
```
