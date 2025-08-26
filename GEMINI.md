# Project Overview

This is a personal website built with Jekyll. It uses the Minima theme and is configured to be a simple, single-page layout with a few navigation links.

The main page displays a profile image, the site title, email address, and a short biography. The header contains links to "About", "Publications", and "Projects" pages. The footer includes links to LinkedIn and email.

# Building and Running

To build and run the website locally, use the following command:

```bash
bundle exec jekyll serve
```

This will start a local development server at `http://localhost:4000`.

# Development Conventions

The website content is written in Markdown. The main content for the home page is in `index.markdown`. The layout is defined in `_layouts/default.html`, and the header and footer are in `_includes/header.html` and `_includes/footer.html` respectively.

Site-wide configuration is managed in the `_config.yml` file. This includes the site title, author, email, and social media links.

# Deployment

This site is hosted on GitHub Pages. The deployment process involves building the Jekyll site and pushing the source code to GitHub, which then automatically publishes the site.

### 1. Build the site locally (Optional)

You can build the site locally to test for any errors before pushing your changes. This step is not required for deployment, as GitHub Pages will build the site for you.

The following command builds the site and places the output in the `_site` directory:

```bash
bundle exec jekyll build
```

### 2. Deploy to GitHub Pages

Deployment is done by committing your changes and pushing them to the `main` branch on GitHub.

```bash
# Add all your changes to be committed
git add .

# Commit your changes with a message
git commit -m "Your descriptive commit message"

# Push your changes to the main branch on GitHub
git push origin main
```

Once you push your changes, GitHub Pages will automatically see the new commit, rebuild your Jekyll site, and update your live website.