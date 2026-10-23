// Build-time settings for the songs landing pages.
// To ship English only: set languages to ['en'] and rebuild. The switcher and all RU strings disappear.
module.exports = {
  languages: ['en', 'ru'],
  defaultLang: 'en',
  appUrl: 'https://web.jggl.ai/',
  brandUrl: 'https://jggl.ai',
  stores: {
    ios: 'https://apps.apple.com/us/app/jggl-ai-music-video-maker/id6739490240',
    android: 'https://play.google.com/store/apps/details?id=ai.jggl.app'
  },
  // Index page at / listing all hypotheses with their audience and metric. noindex, but it is public on a public deploy.
  // Set BUILD_HUB=0 to leave it out.
  buildHub: process.env.BUILD_HUB !== '0',
  // The PostHog project key is public by design, but keep it out of the repo: pass it as an env var at build time.
  posthog: {
    key: process.env.POSTHOG_KEY || '',
    host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com'
  }
};
