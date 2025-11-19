# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Local Development
```bash
cd /Users/russell/Documents/projects/razugo.github.io
bundle exec jekyll serve
```
Starts local development server at `http://localhost:4000`. Navigate to `http://localhost:4000/projects/poker_tracker/` to view this poker tracker application.

### Building
```bash
cd /Users/russell/Documents/projects/razugo.github.io
bundle exec jekyll build
```
Builds the entire Jekyll site including this poker tracker project.

### Testing Changes
- Changes to HTML files auto-reload when Jekyll server is running
- CSS changes auto-reload when Jekyll server is running
- JavaScript changes auto-reload when Jekyll server is running
- No separate build step required for this standalone application

## Project Overview

This is a poker hand tracking application built as a Jekyll multi-page application. It provides comprehensive poker session tracking with real-time hand analysis, bankroll management, and statistical tools. The application uses client-side JavaScript for data management and interactive features.

## Architecture

### Jekyll Multi-Page Application Structure
- **Modular Pages**: Each section (dashboard, sessions, live tracking, tools) has its own HTML page
- **Shared Components**: Navigation and modals use data-component system for initialization
- **Client-side Data**: All data stored in localStorage via PokerTracker.DataStore class
- **Responsive Design**: Mobile-first responsive grid system for poker hand tracking

### Key Architectural Components
- **Data Store (`data-store.js`)**: Centralized PokerSession class with validation and persistence
- **Navigation System**: Jekyll front-matter driven navigation with active state management
- **Component System**: JavaScript modules attached via `data-component` attributes
- **Poker Grid**: 13x13 hand grid representing all Texas Hold'em starting hands

### Data Model
The core data structure is the PokerSession class with properties:
- Financial: `buyIn`, `cashOut`, calculated `profit`
- Timing: `startTime`, `endTime`, `sessionDate`, calculated `duration`
- Hand Tracking: `counts`, `playedCounts`, `handHistory`, `total`, `totalPlayed`, `vpip`
- Meta: `location`, `smallBlind`, `bigBlind`, `notes`

### Poker Hand Grid System
- **Grid Layout**: 13x13 CSS Grid representing all 169 starting hands
- **Hand Representation**: Diagonal = pairs, upper triangle = suited, lower triangle = offsuit
- **Interactive Modes**: Quick tap (dealt/folded), long press (dealt & played)
- **Responsive Sizing**: CSS custom properties scale grid for mobile devices

## Key Features

### Session Management
- Create live sessions for real-time tracking during play
- Track buy-ins, cash-outs, location, stakes, and session notes
- Automatic VPIP calculation based on hands played vs. total hands

### Hand Analysis
- Statistical variance analysis comparing dealt hands to expected distribution
- Z-score calculations for hand strength deviation
- Visual chart representation of session hand distribution

### Tools Suite
- **Hand Strength Tool**: Visual poker hand range selector with percentile highlighting
- **Data Management**: Import/export functionality for session data

## Development Patterns

### Component Initialization
Components initialize via `data-component` attributes:
```html
<div data-component="nav-bar" data-active="dashboard"></div>
```

Corresponding JavaScript:
```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Component auto-initializes based on data-component attribute
});
```

### Data Management Pattern
All data operations go through PokerTracker.DataStore:
```javascript
// Create session
const session = PokerTracker.DataStore.createLiveSession(buyIn);

// Add hand
session.addHand({ hand: 'AKs', played: true });

// Save changes
PokerTracker.DataStore.saveSession(session);
```

### Navigation Pattern
Pages use Jekyll front-matter for navigation state:
```yaml
---
title: PokerTracker - Dashboard
nav_id: dashboard
---
```

## Mobile Considerations

### Responsive Grid Sizing
CSS custom properties handle grid scaling:
```css
:root {
  --cell-size: calc((100vw - 3rem) / 13 - 2px);
  --cell-gap: 2px;
  --cell-font-size: 8px;
}
```

### Touch Interactions
- Long press detection (>600ms) for dual-action hand tracking
- Magnification overlay for precise cell selection on small screens
- Touch-optimized button sizing and spacing
