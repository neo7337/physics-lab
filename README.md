# Physics Lab

A collection of interactive, browser-based physics simulations. Each experiment runs entirely in the browser — no build step, no server, no dependencies.

## Experiments

| Experiment | Description |
|---|---|
| [Double-Slit](double-slit/) | Young's double-slit interference visualizer with real-time wavefronts and exact intensity formula |

## Running an Experiment

1. Clone the repository:
   ```
   git clone https://github.com/neo7337/physics-lab
   ```
2. Open the experiment's `index.html` directly in any modern browser.

## Project Structure

```
physics-lab/
└── double-slit/
    ├── index.html   — simulator
    ├── main.js      — physics and rendering
    ├── style.css    — dark-theme UI
    ├── docs.html    — physics derivations and guided experiments
    └── docs.css
```

## License

[MIT](LICENSE) © 2026 Aditya Kumar
