// Build-time settings for the songs landing pages.
// To ship English only: set languages to ['en'] and rebuild. The switcher and all RU strings disappear.
module.exports = {
  languages: ['en', 'ru'],
  defaultLang: 'en',
  appUrl: 'https://web.jggl.ai/',
  brandUrl: 'https://jggl.ai',
  // Internal page with all hypotheses. On by default locally, off on Vercel (it shows internal hypotheses).
  // Override with BUILD_HUB=1 or BUILD_HUB=0.
  buildHub: process.env.BUILD_HUB ? process.env.BUILD_HUB === '1' : !process.env.VERCEL,
  // The PostHog project key is public by design, but keep it out of the repo: pass it as an env var at build time.
  posthog: {
    key: process.env.POSTHOG_KEY || '',
    host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com'
  }
};
