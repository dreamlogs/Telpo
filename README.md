# Telpo

Interactive learning platform for Calculus 1 and Physics. Vite + React, all visualizations rendered on HTML Canvas, no external UI dependencies.

## Overview

Telpo structures self study around full lecture sequences with three layers of interaction per topic: manipulable graph visualizations, parametric equation explorers, and a typed answer system that provides step by step error correction on failed attempts.

Progress tracking persists locally. The interface is intentionally minimal to reduce friction between opening the app and working through problems.

## Modules

**Calculus 1** maps 32 Professor Leonard lectures (precalculus review through applications of integration) with 7 interactive visualizations covering lines, function transformations, trig, secant/tangent convergence, the limit definition of the derivative, Riemann sums, and concavity analysis. Equation explorers are defined for every lecture that introduces a computable formula.

**Physics** maps 48 lectures across 15 units (vectors through nuclear physics) sourced from Organic Chemistry Tutor and Professor Dave. 9 interactive visualizations: vector addition with parallelogram rule, 1D kinematics, projectile motion, free body diagrams, energy conservation bar charts, simple harmonic motion, transverse waves, Coulomb's law, and series/parallel circuits.

## Architecture

```
src/
  App.jsx          Router, home screen, global progress aggregation
  shared_ui.jsx    Slider (with inline numeric edit), Practice (typed answer engine),
                   EquationExplorer, CanvasGraph, Tip, answer checking logic
  calc_lab.jsx     Calculus curriculum, 7 Canvas visualizations, equation definitions
  physics.jsx      Physics curriculum, 9 Canvas visualizations, equation definitions
```

All visualization state lives in React hooks. Canvas redraws on every parameter change via useCallback. Slider components accept both drag and direct numeric input. The Practice component implements a two attempt flow: incorrect on second try triggers a parsed step by step breakdown of the solution, gated behind an acknowledgment button before the question resolves.

## Run

```
git clone https://github.com/0bzidion/Telpo.git
cd Telpo
npm install
npm run dev
```

Serves at `localhost:5173`.

## Author

Adam Perez
