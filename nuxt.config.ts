// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', 'nuxt-quasar-ui', '@logto/nuxt'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      title: 'UX Chat', // default fallback title
      htmlAttrs: {
        lang: 'en',
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  quasar: {
    plugins: ['BottomSheet', 'Dialog', 'Loading', 'LoadingBar', 'Notify', 'Dark'],
    extras: {
      font: 'roboto-font',
    },
  },

  logto: {
    fetchUserInfo: true,
    pathnames: {
      signIn: '/login',
      signOut: '/logout',
      callback: '/callback',
    },
  },
  runtimeConfig: {
    public: {
      logtoEndpoint: process.env.NUXT_LOGTO_ENDPOINT + 'sign-in',
    },
    logto: {
      endpoint: process.env.NUXT_LOGTO_ENDPOINT,
      appId: process.env.NUXT_LOGTO_APP_ID,
      appSecret: process.env.NUXT_LOGTO_APP_SECRET,
      cookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY,
    },
  },
});
