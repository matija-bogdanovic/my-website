// Sends the bare domain to www (keeping the path), then serves the static site.
const CANONICAL_HOST = "www.matathedev.com";
const REDIRECT_HOSTS = new Set(["matathedev.com"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (REDIRECT_HOSTS.has(url.hostname)) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
