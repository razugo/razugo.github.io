# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive poker session tracking application built as a standalone HTML/CSS/JavaScript web app. The application allows users to track poker hands using an interactive 13x13 grid representing all possible starting hands, analyze session performance, and export/import data across devices.

## Code Architecture

### Modular JavaScript Design
The application uses ES6 modules with three main components:

- **`poker-utils.js`** - Core poker logic and utilities
  - Hand strength calculations (0-100 scale, lower = stronger)
  - VPIP calculations and play style classification
  - Profit/loss formatting and statistical functions
  - Debounce utilities and hand combination logic

- **`session-manager.js`** - Multi-session state management
  - CRUD operations for poker sessions
  - Session aggregation and "All Sessions" view
  - Local storage persistence and data migration
  - Session selector UI management

- **`analysis.js`** - Statistical analysis and visualization
  - Luck analysis using z-scores and standard deviation
  - Histogram generation with Chart.js
  - Bankroll tracking with cumulative profit charts
  - Aggregate statistics across all sessions

### Main Application Structure
- **`poker_clicker.html`** - Single-page application with embedded JavaScript
- **`poker_clicker.css`** - Comprehensive styling with responsive design
- All functionality is contained within the main HTML file using module imports

### Key Data Structures

#### Session Object
```javascript
{
  id: string,           // Unique session identifier
  name: string,         // User-defined session name
  hands: Array,         // Individual hand records with timestamps
  counts: Object,       // Hand frequency counts (dealt)
  playedCounts: Object, // Hand frequency counts (voluntarily played)
  total: number,        // Total hands dealt
  totalPlayed: number,  // Total hands played voluntarily
  vpip: number,         // Calculated VPIP percentage
  buyIn: number,        // Session buy-in amount
  cashOut: number,      // Session cash-out amount
  startTime: string,    // ISO timestamp
  endTime: string,      // ISO timestamp
  notes: string         // Session notes
}
```

#### Hand Record
```javascript
{
  key: string,        // Hand notation (e.g., 'AA', 'AKs', 'AKo')
  timestamp: number,  // Unix timestamp
  played: boolean,    // Whether hand was played voluntarily
  position: number,   // Hand number in session
  notes: string       // Hand-specific notes
}
```

### Grid System
- 13x13 interactive grid representing all 169 possible starting hands
- Coordinate system: (i,j) where i=row, j=column
- Diagonal: pocket pairs (AA, KK, QQ, etc.)
- Upper triangle: suited hands (AKs, AQs, etc.)
- Lower triangle: off-suit hands (AKo, AQo, etc.)

### State Management
- **Local Storage**: Primary persistence using `pokerMultiSessionState` key
- **Session Aggregation**: Dynamic "All Sessions" view combining data from all individual sessions
- **Export/Import**: JSON-based data backup with conflict resolution

### Statistical Analysis
- **Hand Strength**: Percentile ranking system (0-100, lower = stronger)
- **VPIP Analysis**: Percentage of hands played voluntarily
- **Luck Calculation**: Z-score analysis comparing actual vs expected hand distribution
- **Bankroll Tracking**: Cumulative profit/loss visualization

## Development Notes

### Testing the Application
- Open `poker_clicker.html` directly in a web browser
- All dependencies (Chart.js) are loaded via CDN
- No build process or server required

### Data Management
- All data persists in browser localStorage
- Export creates timestamped JSON files for backup
- Import handles session conflicts and duplicate detection
- Session IDs use timestamp + random string for uniqueness

### Touch/Mobile Interaction
- Long press (>600ms) to mark hands as "played"
- Quick tap to mark hands as "dealt but folded"
- Responsive grid sizing based on viewport
- Touch magnification overlay for small screens

### Key Features to Understand
1. **Multi-Session Management**: Users can create, rename, delete, and aggregate sessions
2. **Hand Grid Interaction**: Visual 13x13 grid for intuitive hand tracking
3. **Statistical Analysis**: Real-time luck calculation and distribution visualization
4. **Data Portability**: Full export/import functionality for backup and device transfer
5. **Responsive Design**: Works across desktop and mobile devices