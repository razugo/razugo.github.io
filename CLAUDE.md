# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Jekyll and hosted on GitHub Pages. It uses the Minima theme with custom styling and includes interactive web-based projects like a poker hand clicker application.

## Development Commands

### Local Development
```bash
bundle exec jekyll serve
```
Starts local development server at `http://localhost:4000` with auto-reload for most file changes (config changes require restart).

### Building
```bash
bundle exec jekyll build
```
Builds the site into the `_site` directory for testing before deployment.

### Deployment
Deployment is automatic via GitHub Pages when changes are pushed to the `main` branch. No manual deployment steps required.

## Site Architecture

### Core Structure
- **Jekyll Framework**: Static site generator using Ruby/Bundler
- **Minima Theme**: Base theme with significant customizations
- **Custom Layout Override**: `_layouts/default.html` provides the main page structure
- **Partial Templates**: 
  - `_includes/header.html`: Navigation and profile image
  - `_includes/footer.html`: Footer content
  - `_includes/head.html`: HTML head section

### Styling System
- **Main Stylesheet**: `assets/main.scss` imports Minima and adds custom styles
- **Custom CSS Features**:
  - Profile image positioning (overlaps header/content boundary)
  - Header/footer background styling
  - Home page title layout with centered divider
  - Responsive navigation layout

### Content Organization
- **Home Page**: `index.markdown` - Main landing page with bio
- **Projects**: `pages/projects.markdown` - Project listing page
- **Interactive Projects**: Stored in `projects/` subdirectory as standalone HTML files
  - Projects are self-contained with embedded CSS/JavaScript
  - Currently includes poker hand tracking application with statistical analysis

### Configuration
- **Site Settings**: `_config.yml` contains site metadata, theme config, and build settings
- **Key Settings**:
  - `exclude: ["specs/"]` prevents specification documents from being built
  - Author info, email, and social media links
  - Jekyll plugins: jekyll-feed

### Project-Specific Features
- **Standalone HTML Projects**: Complex interactive applications like `poker_clicker.html` are fully self-contained
- **Statistical Analysis**: Projects may include mathematical calculations (e.g., poker hand strength analysis)
- **Local Storage**: Interactive projects use localStorage for state persistence
- **Responsive Design**: Mobile-first approach with touch interaction support

## Development Notes

### File Modifications
- Changes to `_config.yml` require server restart
- Markdown content changes auto-reload
- SCSS changes auto-reload
- HTML template changes auto-reload

### Adding New Projects
1. Create self-contained HTML file in `projects/[project-name]/` directory
2. Add entry to `pages/projects.markdown` with relative URL
3. Ensure projects include proper responsive design and accessibility features

### Custom Styling
The site extends Minima theme with custom styling focused on:
- Professional portfolio appearance
- Prominent profile image display
- Clean navigation and typography
- Mobile-responsive design