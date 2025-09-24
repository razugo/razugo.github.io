# Project Overview

This project is a single-page web application for tracking poker sessions. It allows users to record their buy-ins, cash-outs, and hand histories, and it provides statistics and visualizations of their performance. The application is built with HTML, CSS, and vanilla JavaScript, and it uses Chart.js for charts and Slim Select for dropdowns. All data is stored locally in the browser's `localStorage`.

# Building and Running

This is a static web project and does not require a build process. To run the application, simply open the `index.html` file in a web browser.

# Development Conventions

The application's JavaScript code is organized into several files in the `assets/js` directory:

*   `app.js`: Contains shared utility functions and initializes the application.
*   `data-store.js`: Defines the `PokerSession` class and manages all data persistence using `localStorage`.
*   `nav-bar.js`: Handles the navigation bar functionality.
*   `new-session-modal.js`: Manages the modal for creating new sessions.
*   `session-settings-modal.js`: Manages the modal for editing session settings.
*   `hand-analysis.js`: Provides hand analysis functionality.
*   `datetime-picker.js`: A wrapper for the Flatpickr date and time picker library.

The application's styles are defined in `assets/styles/main.css`.

The main HTML file is `index.html`, which serves as the main dashboard. Other pages, such as `bankroll/index.html`, `sessions/index.html`, and `tools/index.html`, provide additional functionality.
