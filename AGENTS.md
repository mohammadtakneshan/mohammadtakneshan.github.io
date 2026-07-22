# Agent notes — mohammadtakneshan.github.io

Personal portfolio site. Static HTML/CSS/JS at the repo root, served by GitHub Pages.
Design references live in `design-previews/` — preserve them, never edit (including blog
previews `10`–`14`). The live site is a composition: base layout from template 09, work
rows from 07, projects from 07+06, research cards from 05, recognition rows from 08,
education from 05.

## Blog (`blog/`)

Separate site section for SEO — not an inline homepage section.
- Index: `blog/index.html` (“AI and Autonomous Systems Report”)
- Posts: individual HTML files under `blog/` (e.g. `blog/ai-workflows-operations.html`).
  Every front-page story block links to a real post page; all post bodies are sample
  copy until the final essays are written — layout is final, text is not.
- Section hubs: `blog/systems/`, `blog/research/`, `blog/building/` — linked from the
  “Sections” box on the index; intentionally empty states for now.
- Story images: drop an `<img>` inside a block's `.media` / `.thumb` div — it renders
  uncropped (`contain`). Recommended: lead 1200×800 (3:2), row thumbs 800×600 (4:3).
- RSS: `blog/feed.xml` — add an `<item>` when publishing a post (linked via
  `rel="alternate"` on the index).
- Styles/JS: `blog/styles.css`, `blog/script.js` (theme uses same `localStorage` key `theme`)
- Design source of truth for the live look: `design-previews/11-blog-broadsheet.html`
- Homepage nav “Blogs” links to `blog/`; do not re-add a resume-end blogs block unless asked.

## SEO / AI visibility

- `robots.txt` explicitly allows search, assistant, and training AI crawlers (visibility
  is the goal) — keep the named-bot sections if editing.
- `llms.txt` at the root (llmstxt.org spec): curated markdown map of the site for
  inference-time agents. Google ignores it; update it when pages are added/renamed.
- Blog pages' `og:image` / BlogPosting image: `assets/og/blog-share-1200x630.png`
  (1200×630 share card; regenerate if the blog is renamed). Homepage `og:image` stays
  the profile photo.
- Showcase screenshots are served as WebP (q82, max 2048px wide) with the original
  PNG/JPEG kept beside them; below-fold slides use `loading="lazy" decoding="async"` —
  the first slide stays eager. Follow this when adding slides.
- Sitemap (`sitemap.xml`) must list every indexable page — update `<lastmod>` on changes.


## Update-date convention (top bar)

The date in the top-right of `index.html` (`.date-wrap`) is the **latest site update**, not today's date.
It is static and hand-edited — `script.js` must NOT auto-set it.

On every meaningful site update:

1. Set the visible date (`.date > u`) to the release date, e.g. `Jul 3`.
2. Move the previous date into the top of `.date-wheel` (the hover wheel of past versions).
   Keep the wheel to the 3–4 most recent previous dates; drop older ones.
3. The wheel entries are decorative — not clickable, no hrefs.

## Theming

Two themes via CSS variables: light (default, template 09 palette) and dark
(`html[data-theme="dark"]`, template 06 palette). Toggled by `#themeBtn`, persisted in
localStorage under `theme`. Any new component must use the existing variables so both
themes work — check both before finishing.

## Dynamic island (top bar)

Single click expands it into the music player; double-click opens the iPhone overlay
(`#phoneOverlay`); Esc or backdrop-click closes. Click uses a 220 ms timer so
double-click doesn't also toggle — keep that if editing `script.js`.

## Content status

Placeholder data/screens are intentional for now (device mockups are CSS, stats approximate).
Real screenshots, images, videos, and fact-checking come in a later phase.
Source of truth for content: the owner's LinkedIn export and CV (ask the owner).
