# Matija Bogdanovic – Portfolio

Personal website: static HTML, CSS and JavaScript, no build step.

## Run locally

```bash
python3 -m http.server 3000
```

Then open http://localhost:3000.

## Editing

- **Skill years** update automatically from start dates. Change a start date via `data-since="YYYY-MM"` on the skill card in `index.html`; the career start is `CAREER_START` in `index.js`.
- **Booking calendar** uses the Cal.com username in `CAL_LINK` at the top of `index.js`.
- After changing `index.css` or `index.js`, bump the `?v=` number where they're linked in `index.html` so browsers load the new version.

## Deploy

Hosted on Cloudflare Pages. With the repo connected, every push to `main` deploys automatically. There is no build command and the output directory is `/`.
