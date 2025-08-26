Poker Starting-Hand Clicker — Product Spec (v0.1)
1) Purpose

A single-page tool to track how often each preflop starting hand is dealt (or clicked), visualize relative frequencies, and analyze “luck” against an expected hand-strength distribution. Users increment cells by dragging/tapping across a 13×13 starting-hand grid and can toggle labels between hand codes, counts, and strength percentiles. Results include a basic statistical readout and “luck” category. 

2) Page Structure

Topbar (sticky):

Total badge — shows cumulative clicks (“Total: N”).

Undo button — removes the most recent increment.

Reset button — clears all counts/history. 

Hand Grid: 13×13 responsive grid of button “cells,” one per starting hand. Diagonal = pairs; upper triangle = suited; lower triangle = offsuit. Cell labels display per current mode (codes / counts / strength). 

Toggle Controls:

Toggle Counts — switch cell labels to show counts (exclusive with Strength).

Toggle Strength — show percentile rank per hand (exclusive with Counts). 

Note/Help: brief usage note, color-scale explanation, and external link to original ranking source. 

Analysis Results: dynamic panel with luck category (“High Roll / Expected / Low Roll”), average strength, z-score, and explanatory copy. 

3) Visual/Interaction Design

Grid cells are <button>s with rounded borders; tapping/dragging highlights the “active” cell (scale up) and increments on interaction end. Mobile increases active scale and offsets upward for finger affordance. Background color scales from white → red with higher counts; text color flips to keep contrast. Base background hints type (pair/offsuit/suited). 

Responsive sizing: CSS variables (--cell, --gap, --radius) are recalculated on resize/orientation to keep the 13×13 grid fitting the viewport, with min/max cell caps and adaptive app max-width. 

Accessibility affordances: Grid has an aria-label. Cells are real buttons. (Keyboard activation is implicitly supported by <button>, though primary increment logic is wired to mouse/touch drag-end.) 

4) Data Model & State

Ranks order (descending): A K Q J T 9 8 7 6 5 4 3 2 (13).

Hand map: handStrengths dict mapping codes (AA, AKs, AQo, …) → percentile (0–100; lower is stronger).

Derived expectations: expectedMean, expectedStdDev computed from handStrengths weighted by combination counts (pairs=6, suited=4, offsuit=12).

Mutable state:

counts (per hand integer), total (sum), history (stack of clicked keys), showCounts (bool), showStrength (bool), activeCell (DOM ref), isMouseDown (bool).

Persistence: Full state (except computed fields) saves/loads via localStorage key pokerClickerState. 

5) Hand Keying & Grid Semantics

Canonical key:

Pairs: RR (e.g., TT).

Non-pairs: take higher rank first; s if row index < column index (suited, upper triangle), o otherwise (offsuit, lower triangle).

Diagonal cells receive .pair class for styling emphasis. 

6) Controls & Actions

Tap/Drag across cells: highlights active cell during movement; increments exactly the cell under the finger/mouse on interaction end (mouseup/touchend). Each increment pushes the hand key onto history, bumps counts[key], increments total, triggers render, persists, and re-analyzes luck. 

Undo: pops last key from history, decrements that count (if >0), decrements total, then render/persist/analyze. No-op if history empty. 

Reset: zero all counts, clear total and history, then render/persist/analyze. 

Toggle Counts: flips showCounts; forcibly disables showStrength when enabled (mutually exclusive). Rerender & persist. 

Toggle Strength: flips showStrength; disables showCounts when enabled. Rerender & persist. 

7) Rendering Rules

Topbar: Total: N uses total.

Cell labels:

Default → hand code (e.g., AKs).

Counts mode → counts[key] || 0.

Strength mode → handStrengths[key] (percentile integer).

Coloring: For each cell:

If count > 0 → compute ratio c/max, lerp to rgb(255, g, b) with g=b=255*(1-ratio) (white→red). Adjust text color by luminance threshold.

If 0 → base color by type: suited #D8D8D8, pair #A9A9A9, offsuit #FFFFFF. 

8) Luck / Statistical Analysis

Trigger: after any change (increment/undo/reset) with non-empty history.

Inputs: sequence of dealt (clicked) hands → strengths via handStrengths.

Stats:

mean = average of observed strengths.

zScore = (mean − expectedMean) / (expectedStdDev / sqrt(n)).

Category thresholds:

z < −1.5 → High Roll 🚀 (better than expected).

−1.5 ≤ z ≤ 1.5 → Expected 📊.

z > 1.5 → Low Roll 😩 (worse than expected).

UI: Render a results card with category banner, stat cards (Average Strength, Z-Score, Std Deviation of the mean), and an explanation block comparing observed vs expected. Clear results when history is empty. 

9) Responsiveness & Performance

Sizing algorithm: On resize/orientation change, recompute --gap (phone/tablet/desktop tiers), ideal cell size from viewport width minus margins/gaps, clamp --cell to [18px, 56px], and derive --radius from cell size. Cap app max-width on very large screens. Use throttled resize to 100ms. 

Event wiring: mouse and touch listeners across grid/document to support drag-to-select; passive listeners where appropriate to keep scrolling smooth; prevent default on key interactions to avoid unwanted scroll. 

10) Non-Functional Requirements

Persistence: State must restore across reloads for the same browser via localStorage.

Accessibility: Grid labeled via ARIA; cells are keyboard-focusable buttons; ensure color contrast when counts high (text flips to dark/light).

Performance: Grid render/update should be instantaneous on mid-range mobile; avoid layout thrash (use CSS variables, batch updates).

Mobile UX: Enlarged active cell on touch to indicate selection; drag target follows finger. 

11) Acceptance Criteria (sample)

AC-01 Topbar: After 3 increments, “Total: 3” is visible; Undo reduces to “2”; Reset shows “0”. 

AC-02 Toggling: Tapping Toggle Counts switches all cell labels to integers; tapping Toggle Strength switches to percentile integers; the two modes are mutually exclusive and revert to codes when both off. 

AC-03 Drag Increment: Dragging across three distinct cells and releasing results in exactly three increments (one per cell under finger on release, per current implementation). Cell under final release is incremented once. 

AC-04 Coloring: A cell with the current max count is solid red (text auto-inverts); zero-count cells use base colors by type. 

AC-05 Analysis Panel: With n≥1 history, panel appears with category per z-score thresholds and shows Mean, Z-Score, and Std-Deviation-of-mean; with n=0, panel is hidden. 

AC-06 Persistence: After increments, a reload preserves counts, total, history, and toggle state. 

AC-07 Responsiveness: On a 390×844 viewport (iPhone 12), grid fits width with smaller gaps and larger active scale while dragging.