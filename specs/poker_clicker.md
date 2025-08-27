Poker Starting-Hand Clicker — Product Spec (v0.2)
1) Purpose

A single-page tool to track how often each preflop starting hand is dealt (or clicked), visualize relative frequencies, and analyze “luck” against an expected hand-strength distribution. Users increment cells by dragging/tapping across a 13×13 starting-hand grid and can toggle labels between hand codes, counts, and strength percentiles. Results include a basic statistical readout and “luck” category. 

2) Page Structure

Topbar (sticky):

Total badge — shows cumulative clicks (“Total: N”).

Undo button — removes the most recent increment.

Reset button — clears all counts/history. 

Grid Container: Contains hand grid, toggle controls, and help note in vertical flexbox layout with consistent spacing.

Hand Grid: 13×13 responsive grid of button "cells," one per starting hand. Diagonal = pairs; upper triangle = suited; lower triangle = offsuit. Cell labels display per current mode (codes / counts / strength). 

Toggle Controls:

Toggle Counts — switch cell labels to show counts (exclusive with Strength).

Toggle Strength — show percentile rank per hand (exclusive with Counts).

Toggle Heatmap — switch cell background to a color scale representing hand strength.

Note/Help: brief usage note, color-scale explanation, and external link to original ranking source. 

Analysis Results: dynamic panel with luck category (“High Roll / Expected / Low Roll”), average strength, z-score, and explanatory copy. 

3) Visual/Interaction Design

Grid cells are <button>s with rounded borders; tapping/dragging highlights the “active” cell (scale up) and increments on interaction end. Mobile increases active scale and offsets upward for finger affordance. Background color is determined by the active heatmap mode (frequency or strength). Text color flips to keep contrast. Base background hints at hand type (pair/offsuit/suited) only when counts are zero and the frequency map is active. 

Responsive sizing: CSS variables (--cell, --gap, --radius) are recalculated on resize/orientation to keep the 13×13 grid fitting the viewport, with min/max cell caps and adaptive app max-width. 

Accessibility affordances: Grid has an aria-label. Cells are real buttons. (Keyboard activation is implicitly supported by <button>, though primary increment logic is wired to mouse/touch drag-end.) 

4) Data Model & State

Ranks order (descending): A K Q J T 9 8 7 6 5 4 3 2 (13).

Hand map: handStrengths dict mapping codes (AA, AKs, AQo, …) → percentile (0–100; lower is stronger).

Derived expectations: expectedMean, expectedStdDev computed from handStrengths weighted by combination counts (pairs=6, suited=4, offsuit=12).

Mutable state:

counts (per hand integer), total (sum), history (stack of clicked keys), showCounts (bool), showStrength (bool), showHeatmap (bool), activeCell (DOM ref), isMouseDown (bool).

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

Toggle Heatmap: flips showHeatmap. Rerender & persist. This coloring mode is mutually exclusive with the default frequency-based heatmap.

7) Rendering Rules

Topbar: Total: N uses total.

Cell labels:

Default → hand code (e.g., AKs).

Counts mode → counts[key] || 0.

Strength mode → handStrengths[key] (percentile integer).

Coloring: Governed by the `showHeatmap` flag.

If `showHeatmap` is true (Strength Heatmap):
- Cell background is determined by a 3-point color gradient based on the hand's strength percentile (0-100).
- 0-50 strength: Interpolates from High Roll green to Expected blue.
- 50-100 strength: Interpolates from Expected blue to Low Roll orange.
- Text color flips to keep contrast based on luminance.

If `showHeatmap` is false (Frequency Heatmap):
- If count > 0 → compute ratio c/max, lerp to rgb(255, g, b) with g=b=255*(1-ratio) (white→red). Adjust text color by luminance threshold.
- If 0 → base color by type: suited #D8D8D8, pair #A9A9A9, offsuit #FFFFFF. 

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

UI: Render a results card with category banner, stat cards (Average Strength, Z-Score, and Std Deviation of the mean), and an explanation block comparing observed vs expected. Clear results when history is empty. 

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

AC-07 Responsiveness: On a 390×844 viewport (iPhone 12), app uses full width (no body/container padding), grid maximizes available space with 2px gaps, cells scale to 80px max, and active cells scale 1.5x with -20px vertical offset.

AC-08 Heatmap Toggle: Tapping Toggle Heatmap changes cell backgrounds to a green-blue-orange gradient. Toggling it off reverts to the white-red frequency coloring. The state is persisted on reload.

12) Visual Design System
Color Palette

Neutral Foundation:

Dark: #2d3748 (topbar, primary text)
Mid-dark: #4a5568 (secondary UI elements, muted text)
Mid: #718096 (tertiary text, labels)
Light: #e2e8f0 (borders, subtle dividers)
Lighter: #edf2f7 (hover states)
Lightest: #f7fafc (background panels)
White: #FFFFFF (card backgrounds)

Semantic Colors:

High Roll (Lucky): Linear gradient #10b981 → #059669 (emerald greens)
Expected (Normal): Linear gradient #3b82f6 → #2563eb (confident blues)
Low Roll (Unlucky): Linear gradient #f59e0b → #d97706 (amber-orange warning)
Heat Map: Two modes exist. 1) Frequency: Dynamic RGB interpolation from white rgb(255,255,255) to pure red rgb(255,0,0). 2) Strength: A 3-point gradient from High Roll green (strength 0) to Expected blue (strength 50) to Low Roll orange (strength 100).

Typography
Font Stack: System UI fonts for optimal performance and native feel
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Size Hierarchy:

Banner/Hero: 24px (luck category display)
Large Value: 20px (statistical values)
Body: 14px (explanations, help text)
Label: 12px (stat labels)
Cell: 11px (hand codes/values)

Weight System:

Bold (700): Statistical values, luck banners
Semibold (600): Total badge, cell labels, headers
Medium (500): Buttons, toggles
Normal (400): Body text, explanations

Spatial Design
Container Architecture:

App wrapper: Maximum 900px on large screens, full-width on mobile
Border radius: 12px for main container (premium card feel), 0px on mobile
Content padding: 20px desktop/tablet, 12px mobile (edge-to-edge mobile)
Body padding: 20px desktop/tablet, 0px mobile (full viewport utilization)
Topbar padding: 12px vertical, 16px horizontal (compact utility bar)
Grid container: Flexbox column layout containing grid, toggles, and notes with 24px gap

Component Spacing:

Grid gap: Responsive (2px phone, 3px tablet, 4px desktop)
Control gap: 12px between toggle buttons
Section gap: 20px between app sections (topbar, grid-container, analysis), 24px within grid-container
Inline gap: 8px for related elements

Border Radii:

Large: 20px (total badge pill shape)
Medium: 12px (app container)
Standard: 8px (panels, controls)
Small: 6px (buttons)
Micro: Dynamic 2-10px (grid cells based on size)

Elevation & Depth
Shadow Hierarchy:

Hero: 0 20px 60px rgba(0,0,0,0.3) (main app container, floating card effect)
Elevated: 0 4px 12px rgba(0,0,0,0.3) (active cell during interaction)
Subtle: 0 2px 8px rgba(0,0,0,0.1) (sticky topbar separation)
None: Flat elements maintain clean hierarchy

Animation & Motion
Transition Timing:

Micro: 0.15s (cell hover/active states)
Standard: 0.2s (button interactions)
Smooth: 0.3s (panel appearances)

Easing Function:

Universal ease for natural motion feel

Transform Effects:

Button hover: translateY(-1px) (subtle lift)
Button press: translateY(0) (return to ground)
Cell active: scale(1.15) desktop, scale(1.5) translateY(-20px) mobile
No animations: Analysis panel updates appear instantly without fade-in for rapid interaction

Interaction Design Philosophy
Visual Feedback Principles:

Immediate Response: Active states appear instantly on touch/click
Finger Accommodation: Mobile active states scale larger and offset upward to remain visible under finger
Progressive Disclosure: Heat map intensifies gradually with use
State Persistence: Visual states clearly indicate current mode (counts/strength/default)

Color Psychology:

Light neutral background: Clean, professional appearance focused on data visualization
Green "High Roll": Positive reinforcement, luck, success
Blue "Expected": Neutral, stable, analytical
Amber "Low Roll": Caution without alarm, empathetic acknowledgment
Red heat mapping: Intuitive frequency visualization

Responsive Scaling Logic
Breakpoint Philosophy: Fluid, not fixed

Phone: < 480px (compact, touch-optimized)
Tablet: 480-768px (balanced spacing)
Desktop: > 768px (generous spacing, hover states)
Large: > 1200px (capped width for readability)

Dynamic Calculations:

Cell size: (viewport - padding - gaps) / 13, clamped 18-56px desktop, 18-80px mobile
Border radius: cell-size / 10, minimum 2px
Active scale: 15% boost desktop, 50% boost + elevation mobile

Accessibility Aesthetics
Contrast Management:

Dynamic text color switching at luminance threshold 128
Minimum WCAG AA contrast ratios maintained
Clear visual hierarchy without relying solely on color

Interactive Affordances:

All interactive elements use pointer cursor
Focus states inherit from hover states
Touch targets meet 44x44px minimum through scaling

Brand Personality
The aesthetic combines:

Professional: Clean typography, structured layout, reliable interactions
Playful: Gradient background, emoji indicators, smooth animations
Analytical: Clear data visualization, statistical presentation
Premium: Shadow depth, smooth transitions, cohesive color system