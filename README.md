# Discrete Structures Toolkit

A collection of interactive browser-based tools for a discrete mathematics / discrete structures course. No dependencies, no build step — every tool is a single HTML file that runs locally or on GitHub Pages.

**Live site:** `https://your-username.github.io/discrete-structures/`

---

## Tools

### §1 — Propositional Logic

| Tool | Section | Description |
|---|---|---|
| [Truth Table Builder](truth-table-builder/) | §1.1 · §1.3 | Enter any formula, generate the full truth table, detect tautologies and contradictions |
| [Equivalence Checker](equivalence-checker/) | §1.3 | Compare two formulas side by side, highlights rows where they differ |
| [Implication Explorer](implication-explorer/) | §1.2 | Explore P → Q and its converse, inverse, and contrapositive with interactive toggles and a quiz |
| [Proof Strategy Guide](proof-strategy-guide/) | §1.4 | Interactive reference for direct, contrapositive, contradiction, and other proof techniques |

### Circuits — Digital Logic

| Tool | Description |
|---|---|
| [Logic Gate Simulator](logicsim/) | Drag-and-drop circuit builder with all 9 IEEE gate types, truth table generation, PNG/CSV export |

---

## Getting Started

### Run locally
```bash
git clone https://github.com/your-username/discrete-structures.git
cd discrete-structures
open index.html
```
No server needed — open any `.html` file directly in your browser.

### Deploy to GitHub Pages
1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch**, branch `main`, folder `/ (root)`
4. Save — your site is live at `https://your-username.github.io/discrete-structures/`

---

## Repo Structure

```
discrete-structures/
├── index.html                  ← landing page (links to all tools)
├── README.md
├── truth-table-builder/
│   └── index.html
├── equivalence-checker/
│   └── index.html
├── implication-explorer/
│   └── index.html
├── proof-strategy-guide/
│   └── index.html
└── logicsim/
    ├── index.html
    └── README.md               ← detailed docs for the circuit simulator
```

Each tool is self-contained in its folder. Adding a new tool means creating a new folder with an `index.html` and adding a card to the root `index.html`.

---

## Tech

- Pure HTML, CSS, and vanilla JavaScript
- No frameworks, no build tools, no package manager
- Google Fonts (Orbitron + Share Tech Mono) loaded via CDN for the landing page and LogicSim
- All logic tools use system fonts and work fully offline

---

## License

MIT — free to use, modify, and redistribute for academic or personal projects.
