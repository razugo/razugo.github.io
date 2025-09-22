# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
```bash
cd /Users/rwakugawa/Documents/razugo.github.io
bundle exec jekyll serve
```
Starts local development server at `http://localhost:4000`. Navigate to `http://localhost:4000/projects/poker_tracker/` to view this poker tracker application.

### Building
```bash
cd /Users/rwakugawa/Documents/razugo.github.io
bundle exec jekyll build
```
Builds the entire Jekyll site including this poker tracker project.

### Testing Changes
- Changes to HTML files auto-reload when Jekyll server is running
- CSS changes in `_includes/assets/styles/main.css` auto-reload
- JavaScript changes in `_includes/scripts/` auto-reload
- No separate build step required for this standalone application

## Project Overview

This is a poker hand tracking application built using Jekyll with modular components. It uses URL-based routing with separate pages for each section (dashboard, sessions, live tracking, games) while sharing common components and data layers.

## Architecture

### Jekyll Multi-Page Application
- **Modular Structure**: Separate Jekyll pages for each section with shared layout and components
- **URL Routing**: Each page has its own URL path (/, /bankroll, /sessions, /session, /games, /tools, /tools/hand_strength)
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
- **Tools Suite**: Hand strength analyzer and other poker utilities
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
├── bankroll/index.html           # Bankroll analytics
├── sessions/index.html           # Sessions management page
├── session/index.html            # Individual session tracking page
├── games/index.html              # Games management page
└── tools/
    ├── index.html               # Tools overview page
    └── hand_strength/index.html # Hand strength analysis tool

assets/
├── styles/main.css               # Global styles
└── js/
    ├── data-store.js            # Centralized data management
    ├── app.js                   # Shared utilities
    ├── nav-bar.js               # Navigation component logic
    ├── new-session-modal.js     # New session modal component
    ├── new-game-modal.js        # New game modal component
    └── session-settings-modal.js # Session settings modal component
```

## Development Notes

### Navigation
- Each page uses Jekyll's `nav_id` front matter for active navigation state
- Global nav behavior lives in `assets/js/nav-bar.js` and consumes the `data-component="nav-bar"` placeholder
- Links rely on `relative_url` helpers so pages work regardless of depth
- Mobile navigation toggle handled directly in the nav-bar component

### Data Management
- `PokerTracker.DataStore` provides centralized data access
- Shared utilities (`PokerTracker.Utils`, modals) live in `assets/js/` modules
- Statistics calculations happen in the data store for consistency

### Component System
- Components render via JavaScript modules (`assets/js/*-modal.js`, `nav-bar.js`) attached with `data-component` hooks
- Keep component scripts self-contained and namespaced under `PokerTracker.*`
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
1. Create component file in `components/`
2. Include component in pages using `{% include_relative components/component-name.html %}`
3. Add component-specific styles to `assets/styles/main.css`
4. Add component JavaScript within the component file

### Modifying Data Structure
1. Update data objects in `assets/js/data-store.js`
2. Update related display functions across all pages
3. Ensure data validation and error handling

### Styling Changes
1. Modify CSS custom properties in `:root` for theme changes
2. Add new component styles following existing patterns
3. Test responsive behavior across all pages

### Adding New Tools
1. Create tool page as Jekyll page with front matter (`nav_id: tools`)
2. Add tool card to `tools/index.html` with appropriate `onclick="openTool('tool-name')"`
3. Add tool-specific styles to `assets/styles/main.css`
4. Use shared nav-bar component with `{% include_relative components/nav-bar.html %}`
5. Include shared CSS with `<link rel="stylesheet" href="assets/styles/main.css">`

### Tool Architecture Notes
- **Hand Strength Tool**: Uses responsive poker grid with percentage-based range selection
- **Grid Sizing**: CSS custom properties (`--cell-size`, `--cell-gap`, `--cell-font-size`) for responsive design
- **Mobile Optimization**: Viewport-width calculations for full-screen grid on mobile devices
- **Range Selection**: Slider + editable input for precise percentage control with real-time highlighting