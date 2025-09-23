# Repository Guidelines

## Project Structure & Module Organization
The poker tracker lives under `projects/poker_tracker` within the parent Jekyll site. Page-level experiences are plain HTML files (`index.html`, `bankroll/index.html`, `sessions/index.html`, `session/index.html`, `tools/index.html`, `tools/data_magement/index.html`, `tools/hand_strength/index.html`) that share the poker layout defined upstream. Shared UI is delivered via JS components under `assets/js/` (navigation, modals). Styling centralizes in `assets/styles/main.css`; keep new rules scoped with descriptive, kebab-case class names. Core data logic remains in `assets/js/data-store.js` with shared helpers in `assets/js/app.js`.

## Build, Test, and Development Commands
- `cd /Users/rwakugawa/Documents/razugo.github.io && bundle exec jekyll serve --livereload` serves `http://localhost:4000/projects/poker_tracker/` with auto-reloading pages.
- `cd /Users/rwakugawa/Documents/razugo.github.io && bundle exec jekyll build` compiles the static site prior to publishing.
- `rm -rf _site/.jekyll-cache` (run from the repo root) clears stale includes when layouts or includes misbehave.

## Coding Style & Naming Conventions
Use two-space indentation across HTML, CSS, and JavaScript. Favor `const`/`let`, single quotes, and trailing commas in JS to match existing files. Extend the `PokerTracker` namespaces instead of creating globals; expose helpers via `PokerTracker.Utils` or new modules. Keep CSS tokens as custom properties in `:root`; align component class names with existing `card-*`, `table-*`, and `stats-*` patterns. Every page needs front matter (`nav_id`, `title`) for navigation state.

## Testing Guidelines
No automated suite exists. After changes, run the local Jekyll server and click through dashboard, sessions, live session creation, and tools to confirm navigation, modal flows, and localStorage updates. When touching data-store logic, wipe browser storage (DevTools → Application → Local Storage → Clear) and retest fresh and migrated scenarios. Capture any console warnings. Document manual test notes in PRs when workflows change.

## Commit & Pull Request Guidelines
History favors concise, lower-case commit subjects (e.g., `action menu`, `update start time end time formatting`). Follow the same style and group related edits per commit. Pull requests should include a high-level summary, before/after screenshots for UI-visible changes, clear testing notes (`jekyll serve`, browsers exercised), and links to tracking issues. Highlight risks to localStorage data or navigation so reviewers can focus verification.
