# Two Under The Sky

Travel, reflections, and discoveries we make along the way — by **Kesha** and **Akshat**.

🌐 **Live Site:** [https://twounderthesky.github.io/twounderthesky/](https://twounderthesky.github.io/twounderthesky/)

## About

This is a Jekyll-based personal blog built using the [Jasper2](https://github.com/jekyllt/jasper2) theme, which is a port of Ghost's Casper theme. The blog documents our diverse experiences - from travel adventures and offbeat explorations to cooking experiments, professional break journeys, spiritual reflections, and all the random moments that shape our lives.

## Features

- ✨ Beautiful, minimal, and responsive design
- 👥 Multi-author support (Kesha & Akshat)
- 🏷️ Tag-based organization (travel, thoughts, etc.)
- 📱 Mobile-friendly responsive layout
- 🔍 SEO optimized
- 📝 Markdown-based content management
- 🎨 Customizable theme and styling
- 📊 Google Analytics integration ready
- 💬 Disqus comments support (optional)

## Tech Stack

- **Jekyll** - Static site generator
- **Ruby** - Runtime environment
- **Node.js/Gulp** - CSS compilation and asset management
- **GitHub Pages** - Hosting platform

## Prerequisites

Before you begin, ensure you have the following installed:

- **Ruby** (2.6.3 or compatible)
- **Bundler** (`gem install bundler`)
- **Node.js** and **npm** (for CSS compilation)
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/twounderthesky/twounderthesky.git
cd twounderthesky
```

### 2. Install Dependencies

Install Ruby gems:

```bash
cd source
bundle install
```

Install Node.js dependencies (for CSS compilation):

```bash
npm install
```

### 3. Configure the Site

Edit `source/_config.yml` to customize:

- Site title and description
- Author information in `source/_data/authors.yml`
- Tag information in `source/_data/tags.yml`
- Social media links
- Google Analytics ID
- Base URL (if deploying to a subdirectory)

**Important:** If deploying to GitHub Pages with a project repository (not username.github.io), ensure:
- `url: https://twounderthesky.github.io`
- `baseurl: /twounderthesky/`

### 4. Local Development

Start the Jekyll development server:

```bash
cd source
bundle exec jekyll serve
```

The site will be available at:
- **http://localhost:4000/twounderthesky/** (with baseurl)
- The server auto-reloads when you make changes

To stop the server, press `Ctrl+C`.

### 5. Compile CSS (Optional)

If you need to modify styles, compile CSS using Gulp:

```bash
cd source
npm install
gulp
```

This compiles files from `assets/css/` to `assets/built/`.

## Project Structure

```
twounderthesky/
├── docs/                  # Generated static site (deployed to GitHub Pages)
├── source/                # Jekyll source files
│   ├── _config.yml        # Site configuration
│   ├── _data/             # Data files (authors, tags)
│   ├── _includes/         # Reusable HTML components
│   ├── _layouts/          # Page templates
│   ├── _plugins/          # Custom Jekyll plugins
│   ├── _posts/            # Blog posts (Markdown files)
│   ├── about/             # About page
│   ├── assets/            # Images, CSS, JS
│   └── index.html         # Homepage
└── README.md              # This file
```

## Writing Posts

Create new posts in `source/_posts/` with the following naming convention:

```
YYYY-MM-DD-post-title.md
```

Example front matter:

```yaml
---
layout: post
title: "Your Post Title"
author: kesha  # or akshat, or ka (for both)
date: 2024-01-15
cover: assets/images/your-cover-image.jpg
tags: [travel, hiking]
---
```

## Building for Production

Build the static site:

```bash
cd source
bundle exec jekyll build
```

This generates the site in the `docs/` directory, which is what gets deployed to GitHub Pages.

## Deployment

### GitHub Pages

1. Push changes to the `main` branch
2. GitHub Pages automatically builds and deploys from the `docs/` folder
3. The site will be live at `https://twounderthesky.github.io/twounderthesky/`

**Note:** Make sure to rebuild the site (`bundle exec jekyll build`) before committing if you've made changes to source files.

### Manual Deployment

1. Build the site: `bundle exec jekyll build`
2. Commit and push the `docs/` folder changes
3. GitHub Pages will automatically update

## Configuration

### Authors

Edit `source/_data/authors.yml` to manage author information:

```yaml
kesha:
  username: kesha
  name: Kesha Shah
  picture: assets/images/kesha.jpg
  bio: Your bio here
  # ... other fields
```

### Tags

Edit `source/_data/tags.yml` to customize tag descriptions and covers.

### Site Settings

Key settings in `source/_config.yml`:

- `url` - Your site's base URL
- `baseurl` - Subdirectory path (e.g., `/twounderthesky/`)
- `title` - Site title
- `description` - Site description
- `paginate` - Posts per page
- `google_analytics` - Analytics tracking ID

## Troubleshooting

### Styles Not Loading

- Ensure `baseurl` in `_config.yml` matches your deployment path
- Rebuild the site: `bundle exec jekyll build`
- Check that asset paths use `{{ site.baseurl }}` in templates

### Images Not Showing

- Use `{{ site.baseurl }}assets/images/...` for image paths in Markdown
- Ensure images exist in `source/assets/images/`
- Rebuild after adding new images

### Local Server Issues

- Clear Jekyll cache: `bundle exec jekyll clean`
- Restart the server
- Check Ruby and Jekyll versions compatibility

## Contributing

This is a personal blog, but suggestions and improvements are welcome! Feel free to:

- Report bugs or issues
- Suggest features
- Submit pull requests

## License

This project uses the Jasper2 theme, which is based on Ghost's Casper theme and released under the MIT License.

## Contact

- **Instagram:** [@2underthesky](https://instagram.com/2underthesky)
- **Website:** [Two Under The Sky](https://twounderthesky.github.io/twounderthesky/)

---

Built with ❤️ using Jekyll and the Jasper2 theme.
