# Poker Starting-Hand Clicker — Product Spec (v0.3)

## 1) Purpose

A single-page tool for live poker session tracking that monitors preflop starting hands, tracks playing decisions, and provides real-time statistics. Users can mark hands as dealt or played, view VPIP (Voluntary Put In Pot) percentages, review hand history, and analyze "luck" against expected hand-strength distributions. The tool supports both quick-entry grid mode and detailed list view for comprehensive session management.

## 2) Page Structure

**Topbar (sticky):**
- Total badge — shows cumulative hands dealt ("Total: N")
- Undo button — removes the most recent action
- Reset button — clears all counts/history with confirmation dialog

**Stats Bar (sticky, below topbar):**
- VPIP percentage with count ("VPIP: 23.5% (8/34)")
- PFR percentage with count ("PFR: 11.8% (4/34)")
- Visual indicator for play style (tight/normal/loose)

**View Tabs:**
- Grid View — default 13×13 hand matrix
- List View — chronological hand history
- Stats View — detailed session statistics (future)

**Grid Container (Grid View):** 
Contains hand grid, toggle controls, and help note in vertical flexbox layout with consistent spacing.

**Hand Grid:** 
13×13 responsive grid of button "cells," one per starting hand. Diagonal = pairs; upper triangle = suited; lower triangle = offsuit. Cells show dealt count, played indicator, and can display labels per current mode (codes/counts/strength).

**List Container (List View):**
- Scrollable list of all dealt hands in reverse chronological order
- Each item shows: hand, position number, played/folded status, outcome
- Swipe actions for editing status

**Toggle Controls (Grid View only):**
- Toggle Counts — switch cell labels to show counts
- Toggle Strength — show percentile rank per hand
- Toggle Heatmap — switch to strength-based color gradient
- Toggle Played Only — filter to show only played hands

**Note/Help:** 
Brief usage note, interaction guide, and external link to hand rankings.

**Analysis Results:** 
Dynamic panel with luck category, session statistics, and performance insights.

## 3) Visual/Interaction Design

**Grid Interaction Modes:**
- **Quick tap** — marks hand as dealt (folded)
- **Long press (>300ms)** — marks hand as dealt AND played
- **Visual feedback** — Played hands show green indicator dot or ring

Grid cells are `<button>`s with rounded borders; tapping/dragging highlights the "active" cell (scale up). Interaction triggers different actions based on duration. Mobile increases active scale and offsets upward for finger affordance.

**List Item Design:**
- Height: 56px per row
- Left section: Hand with suit symbols/colors
- Center: Sequential hand number
- Status badges: Played (green dot) or Folded (gray)
- Swipe right: Toggle played/folded status
- Swipe left: Delete hand from history

**Stats Bar Visualization:**
- Semi-transparent overlay with real-time updates
- Color-coded VPIP ranges:
  - Tight (<20%): Blue `#3b82f6`
  - Normal (20-30%): Green `#10b981`
  - Loose (>30%): Amber `#f59e0b`
- Smooth transitions on percentage changes

Responsive sizing: CSS variables (--cell, --gap, --radius) recalculated on resize/orientation to keep the 13×13 grid fitting the viewport, with min/max cell caps and adaptive app max-width.

Accessibility affordances: Grid has aria-label. Cells are real buttons with keyboard support. List items are focusable with keyboard navigation.

## 4) Data Model & State

**Core Data:**
- Ranks order (descending): A K Q J T 9 8 7 6 5 4 3 2 (13)
- Hand map: handStrengths dict mapping codes → percentile (0–100; lower is stronger)
- Derived expectations: expectedMean, expectedStdDev computed from handStrengths

**Enhanced Mutable State:**
```javascript
{
  hands: [
    {
      key: "AKs",           // hand code
      timestamp: Date.now(), // when dealt
      played: true,         // true if played, false if folded
      position: 3,          // hand number in session
      outcome: null,        // 'won'/'lost'/null (future)
      pot: null,           // pot size (future)
      notes: ""            // hand notes (future)
    }
  ],
  counts: {},              // per hand total count
  playedCounts: {},        // per hand played count
  total: 0,                // total hands dealt
  totalPlayed: 0,          // total hands played
  vpip: 0,                 // calculated VPIP percentage
  pfr: 0,                  // calculated PFR percentage (future)
  currentView: 'grid',     // 'grid' or 'list'
  showCounts: false,
  showStrength: false,
  showHeatmap: false,
  showPlayedOnly: false,
  activeCell: null,
  isMouseDown: false,
  longPressTimer: null
}
```

**Persistence:** 
Full state saves/loads via localStorage key `pokerClickerState`. Session data exports to JSON/CSV.

## 5) Hand Keying & Grid Semantics

**Canonical key:**
- Pairs: RR (e.g., TT)
- Non-pairs: higher rank first; 's' if suited (upper triangle), 'o' if offsuit (lower triangle)

**Visual Indicators:**
- Diagonal cells receive `.pair` class
- Played hands receive `.played` class with visual indicator
- Active cell during long press shows `.playing` animation

## 6) Controls & Actions

**Grid Interactions:**

*Quick Tap:*
- Marks hand as dealt (folded)
- Increments counts[key] and total
- Adds entry to hands array with played: false
- Updates VPIP calculation
- Triggers render and persist

*Long Press (>300ms):*
- Marks hand as dealt AND played
- Increments counts[key], playedCounts[key], total, and totalPlayed
- Adds entry to hands array with played: true
- Updates VPIP/PFR calculations
- Shows visual feedback during press
- Triggers render and persist

**List Interactions:**

*Swipe Right:*
- Toggles played/folded status
- Updates playedCounts and totalPlayed
- Recalculates VPIP/PFR
- Animated status change

*Swipe Left:*
- Removes hand from history
- Updates all related counts
- Recalculates statistics

**Global Actions:**

*Undo:*
- Removes last hand from hands array
- Updates all affected counts
- Recalculates statistics
- Works across both grid and list views

*Reset:*
- Shows confirmation dialog
- Clears all hands, counts, and statistics
- Maintains view preferences

*View Toggle:*
- Switches between grid/list/stats views
- Maintains selection state
- Smooth transition animation

## 7) Rendering Rules

**Topbar:** 
- Shows "Total: N" using state.total
- Updates in real-time

**Stats Bar:**
- VPIP: `(totalPlayed / total * 100)`
- Shows count ratio in parentheses
- Color changes based on percentage ranges
- PFR placeholder for future implementation

**Grid Cell Labels:**
- Default → hand code (e.g., AKs)
- Counts mode → total dealt count
- Strength mode → percentile rank
- Played indicator → green dot overlay if played > 0

**Grid Cell Coloring:**

*Frequency Heatmap (default):*
- Count > 0: White to red gradient based on frequency
- Count = 0: Base colors (suited #D8D8D8, pair #A9A9A9, offsuit #FFFFFF)
- Played overlay: Green ring or dot indicator

*Strength Heatmap:*
- 0-50: Green to blue gradient
- 50-100: Blue to orange gradient
- Played overlay maintains visibility

**List View Rendering:**
- Reverse chronological order (newest first)
- Hand number badge (#1, #2, etc.)
- Status icon (● played, ○ folded)
- Alternating row backgrounds for readability

## 8) Statistical Analysis

**VPIP Calculation:**
- Formula: `(hands.filter(h => h.played).length / hands.length) * 100`
- Updates after every hand action
- Displays to 1 decimal place

**Session Luck Analysis:**
- Triggered after any hand action with non-empty history
- Uses only dealt hands (not limited to played)
- Same z-score categories as before

**Play Analysis (future):**
- Actual range vs. GTO range comparison
- Position-based VPIP tracking
- Win rate when playing vs. folding premium hands

## 9) Responsiveness & Performance

**View-Specific Optimization:**
- Grid: Batch DOM updates, use CSS transforms for animations
- List: Virtual scrolling for sessions >100 hands
- Stats bar: Debounced updates to prevent flicker

**Interaction Performance:**
- Long press detection via setTimeout(300ms)
- Haptic feedback on mobile for played hands
- Immediate visual feedback for all interactions

## 10) Non-Functional Requirements

**Live Session Usage:**
- One-handed operation optimized
- Stealth mode option (darker colors, no sounds)
- Works fully offline
- Auto-save after every action
- Export session data as CSV/JSON

**Data Integrity:**
- Confirmation dialog for reset
- Undo stack maintains last 10 actions
- Session backup every 5 minutes
- Recovery mode for corrupted data

## 11) Acceptance Criteria

**AC-01** Quick tap on grid increments dealt count, long press increments both dealt and played counts.

**AC-02** VPIP displays as percentage with fraction (e.g., "23.5% (8/34)") and updates immediately.

**AC-03** List view shows all hands chronologically with swipe actions functional.

**AC-04** Stats bar changes color based on VPIP ranges (tight/normal/loose).

**AC-05** Played hands show distinct visual indicator in grid (green dot/ring).

**AC-06** View toggle maintains state and provides smooth transitions.

**AC-07** All session data persists across reloads including played status.

**AC-08** Undo correctly reverts last action whether from grid or list view.

**AC-09** Export generates valid CSV with columns: hand, dealt_count, played_count, vpip_at_time.

**AC-10** Mobile long press shows visual feedback during hold duration.

## 12) Visual Design System

**Color Palette**

*Neutral Foundation:*
- Dark: #2d3748 (topbar, primary text)
- Mid-dark: #4a5568 (stats bar background, secondary UI)
- Mid: #718096 (tertiary text, labels)
- Light: #e2e8f0 (borders, dividers)
- Lighter: #edf2f7 (hover states)
- Lightest: #f7fafc (background panels)
- White: #FFFFFF (card backgrounds)

*Semantic Colors:*
- Played/Active: #10b981 (emerald green)
- Folded/Inactive: #9CA3AF (gray)
- Tight Play: #3b82f6 (blue)
- Normal Play: #10b981 (green)
- Loose Play: #f59e0b (amber)
- High Roll: Linear gradient #10b981 → #059669
- Expected: Linear gradient #3b82f6 → #2563eb
- Low Roll: Linear gradient #f59e0b → #d97706

*Interactive States:*
- Long press: Pulsing green glow animation
- Swipe right: Green slide transition
- Swipe left: Red slide transition

**Typography**
- Stats Bar: 16px semibold for percentages, 12px for labels
- List items: 14px medium for hands, 12px for metadata
- Other typography remains as specified in v0.2

**Animation & Motion**

*New Transitions:*
- Long press: 0.3s hold with visual progress indicator
- View switch: 0.3s slide transition
- Stats update: 0.2s ease for percentage changes
- List swipe: 0.2s slide with bounce-back

**Mobile-First Enhancements**
- Larger tap targets (min 48px) for session tracking
- Bottom sheet pattern for list view on mobile
- Thumb-reachable controls in portrait orientation
- Haptic feedback for played hands (where supported)

**Session Tracking UI**
- Persistent stats bar for at-a-glance metrics
- Clear visual distinction between dealt and played
- Streamlined data entry for minimal game disruption
- Privacy-conscious design (subtle colors, no flashing)