// Builds one page per job in content/journey.json → journey/<slug>/index.html
// Run after editing the content file:  node scripts/build-journey.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const roles = JSON.parse(readFileSync(join(root, "content/journey.json"), "utf8"));

// Bump when index.css / page.js change so browsers fetch the new version
const ASSET_VERSION = "4";

// Main address of the live site (used for canonical links, previews and the sitemap)
const SITE = "https://matathedev.com";

const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const TOOL_ICONS = {
  Webflow: "/assets/icons/webflow.svg",
  Framer: `${DEVICON}/framermotion/framermotion-original.svg`,
  Shopify: "/assets/icons/shopify.svg",
  HTML: `${DEVICON}/html5/html5-original.svg`,
  CSS: `${DEVICON}/css3/css3-original.svg`,
  JavaScript: `${DEVICON}/javascript/javascript-original.svg`,
  TypeScript: `${DEVICON}/typescript/typescript-original.svg`,
  React: `${DEVICON}/react/react-original.svg`,
  "Next.js": `${DEVICON}/nextjs/nextjs-original.svg`,
  "Node.js": `${DEVICON}/nodejs/nodejs-original.svg`,
  Figma: `${DEVICON}/figma/figma-original.svg`,
  Firebase: `${DEVICON}/firebase/firebase-original.svg`,
  AWS: "/assets/icons/aws.svg",
};
const MONO = new Set(["Framer", "Next.js"]);

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function toolChip(name) {
  const icon = TOOL_ICONS[name];
  const img = icon
    ? `<img src="${icon}" alt="" width="20" height="20"${MONO.has(name) ? ' class="mono"' : ""}>`
    : "";
  return `<li>${img}${esc(name)}</li>`;
}

function roleNav(role, label, dir) {
  if (!role) return `<span class="role-nav-empty"></span>`;
  return `<a class="role-nav-link role-nav-${dir}" href="/journey/${role.slug}/">
            <small>${label}</small>
            <strong>${esc(role.title)}</strong>
            <span>${esc(role.org)} · ${esc(role.dates)}</span>
          </a>`;
}

function breadcrumbs(role) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "My journey", item: `${SITE}/#experience` },
      { "@type": "ListItem", position: 3, name: `${role.title} at ${role.org}`, item: `${SITE}/journey/${role.slug}/` },
    ],
  };
}

function page(role, i) {
  const prev = roles[i - 1];
  const next = roles[i + 1];
  const title = `${role.title} at ${role.org} | Matija Bogdanovic`;
  const description = `${role.summary} What I did and what I learned as ${role.title} at ${role.org}.`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="author" content="Matija Bogdanovic">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#4f5bd5">
    <meta name="color-scheme" content="light dark">
    <link rel="canonical" href="${SITE}/journey/${role.slug}/">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${SITE}/journey/${role.slug}/">
    <meta property="og:site_name" content="Matija Bogdanovic">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(role.summary)}">
    <meta property="og:image" content="${SITE}/og-image.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${SITE}/og-image.jpg">
    <script type="application/ld+json">
${JSON.stringify(breadcrumbs(role), null, 2)}
    </script>
    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/index.css?v=${ASSET_VERSION}">
    <script src="/page.js?v=${ASSET_VERSION}" defer></script>
  </head>
  <body class="role-page">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container navwrapper">
        <a href="/" class="brand">
          <img src="/assets/profile.webp" alt="" width="40" height="40" class="pfp">
          <span>Matija Bogdanovic</span>
        </a>
        <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
        <nav id="site-nav">
          <ul>
            <li><a href="/#about">About</a></li>
            <li><a href="/#experience" class="active">Journey</a></li>
            <li><a href="/#skills">Skills</a></li>
            <li><a href="/#certifications">Certifications</a></li>
            <li><a href="/#contact">Contact</a></li>
            <li><a href="/#book" class="nav-cta">Book a call</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="main">
      <section class="role-hero">
        <div class="container">
          <a class="back-link" href="/#experience">← Back to my journey</a>
          <p class="eyebrow">Stop ${i + 1} of ${roles.length} · ${esc(role.dates)}</p>
          <h1>${esc(role.title)}</h1>
          <p class="role-org">${esc(role.org)}${role.location && !role.tags.includes(role.location) ? `, ${esc(role.location)}` : ""} ${role.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join(" ")}</p>
          <p class="lead">${esc(role.summary)}</p>
          <ol class="role-progress" aria-label="Journey progress">
            ${roles.map((r, k) => `<li class="${k < i ? "done" : k === i ? "current" : ""}"><a href="/journey/${r.slug}/" aria-label="${esc(r.title)} at ${esc(r.org)}"${k === i ? ' aria-current="page"' : ""}></a></li>`).join("")}
          </ol>
        </div>
      </section>

      <section class="section section-alt">
        <div class="container role-grid">
          <div>
            <h2 class="section-title">What I did</h2>
            <ul class="role-did">
              ${role.did.map((d) => `<li class="reveal-item">${esc(d)}</li>`).join("\n              ")}
            </ul>
            <h2 class="section-title role-tools-title">Tools I used</h2>
            <ul class="chips">
              ${role.tools.map(toolChip).join("\n              ")}
            </ul>
          </div>
          <div>
            <h2 class="section-title">What I learned</h2>
            <div class="role-learned">
              ${role.learned
                .map(
                  (l, k) => `<article class="learned-card spotlight reveal-item">
                <span class="learned-num">${String(k + 1).padStart(2, "0")}</span>
                <h3>${esc(l.title)}</h3>
                <p>${esc(l.text)}</p>
              </article>`
                )
                .join("\n              ")}
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <nav class="role-nav" aria-label="More from my journey">
            ${roleNav(prev, "← Previous stop", "prev")}
            ${roleNav(next, "Next stop →", "next")}
          </nav>
          <div class="role-cta">
            <p>Have a project in mind?</p>
            <a class="btn btn-primary" href="/#book">Book a call</a>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container">
        <p>© <span id="date">2026</span> Matija Bogdanovic. All rights reserved.</p>
        <a href="/">Home</a>
      </div>
    </footer>
  </body>
</html>
`;
}

// Rebuild the journey folder from scratch so removed jobs don't linger
const outDir = join(root, "journey");
if (existsSync(outDir)) rmSync(outDir, { recursive: true });
roles.forEach((role, i) => {
  const dir = join(outDir, role.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(role, i));
  console.log(`✓ journey/${role.slug}/`);
});

// Sitemap for search engines: homepage + every journey page
const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, ...roles.map((r) => `${SITE}/journey/${r.slug}/`)];
writeFileSync(
  join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join("\n")}
</urlset>
`
);
console.log("✓ sitemap.xml");
