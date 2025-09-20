# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a poker hand tracking application built using Jekyll with modular components. It uses URL-based routing with separate pages for each section (dashboard, sessions, live tracking, games) while sharing common components and data layers.

## Architecture

### Jekyll Multi-Page Application
- **Modular Structure**: Separate Jekyll pages for each section with shared layout and components
- **URL Routing**: Each page has its own URL path (/, /sessions, /live, /games)
- **Shared Components**: Reusable components in `_includes/components/`
- **Shared Data Layer**: Centralized data management in `_includes/scripts/data-store.js`

### Core Components
- **Layout System**: `_layouts/poker-app.html` provides shared structure
- **Navigation Component**: `_includes/components/nav-bar.html` with Jekyll-based routing
- **Data Management**: `_includes/scripts/data-store.js` for centralized data access
- **Poker Hand Grid**: `_includes/components/poker-grid.html` reusable component
- **Statistics Components**: Shared across dashboard and other pages

### Key Features
- **Multi-Game Support**: Configurable poker games with different stakes and locations
- **Session Management**: Track buy-ins, cash-outs, hands played, and VPIP statistics
- **Live Session Mode**: Interactive poker grid for real-time hand tracking during play
- **Data Visualization**: Bankroll progress charts and statistical analysis
- **Responsive UI**: Works on both desktop and mobile devices

## Data Structure

### Games Object
```javascript
{
  id: 'game-identifier',
  name: 'Display Name',
  location: 'Venue Name',
  stakes: { smallBlind: number, bigBlind: number, currency: 'USD' },
  defaultBuyIn: number
}
```

### Sessions Object
```javascript
{
  id: 'session-identifier',
  date: 'YYYY-MM-DD',
  gameId: 'reference-to-game',
  buyIn: number,
  cashOut: number,
  hands: number,
  vpip: number, // percentage
  duration: number, // minutes
  status: 'active' | 'completed'
}
```

## File Structure

```
poker_tracker/
├── index.html                    # Dashboard page (main entry)
├── sessions.html                 # Sessions management page
├── live.html                     # Live session tracking page
├── games.html                    # Games management page
├── _layouts/
│   └── poker-app.html           # Shared layout template
├── _includes/
│   ├── components/
│   │   ├── nav-bar.html         # Navigation component
│   │   ├── fab.html             # Floating action button
│   │   └── poker-grid.html      # Poker hand grid component
│   ├── scripts/
│   │   ├── data-store.js        # Centralized data management
│   │   └── app.js               # Shared utilities
│   └── styles/
│       └── main.css             # All CSS styles
└── assets/
    └── js/                      # Additional JS files if needed
```

## Development Notes

### Navigation
- Each page uses Jekyll's `nav_id` front matter for active navigation state
- Navigation links use `{{ site.baseurl }}` for proper URL construction
- Mobile navigation toggle handled in nav-bar component

### Data Management
- `PokerTracker.DataStore` provides centralized data access
- All pages share the same data layer through Jekyll includes
- Statistics calculations happen in the data store for consistency

### Component System
- Components are included using Jekyll's `{% include %}` syntax
- Each component is self-contained with its own HTML, CSS, and JavaScript
- Shared utilities available through `PokerTracker.Utils`

### Poker Grid Logic
- 13x13 grid representing all Texas Hold'em starting hands
- Diagonal cells represent pocket pairs (AA, KK, etc.)
- Upper triangle represents suited hands (AKs, QJs, etc.)
- Lower triangle represents off-suit hands (AKo, QJo, etc.)

## Common Tasks

### Adding New Pages
1. Create new HTML file with Jekyll front matter
2. Set appropriate `nav_id` for navigation highlighting
3. Use `layout: poker-app` for consistent structure
4. Add navigation link to `_includes/components/nav-bar.html`

### Adding New Components
1. Create component file in `_includes/components/`
2. Include component in pages using `{% include components/component-name.html %}`
3. Add component-specific styles to `_includes/styles/main.css`
4. Add component JavaScript within the component file

### Modifying Data Structure
1. Update data objects in `_includes/scripts/data-store.js`
2. Update related display functions across all pages
3. Ensure data validation and error handling

### Styling Changes
1. Modify CSS custom properties in `:root` for theme changes
2. Add new component styles following existing patterns
3. Test responsive behavior across all pages