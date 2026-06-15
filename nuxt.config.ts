// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/content', 'nuxt-quasar-ui'],
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  quasar: {
    plugins: ['BottomSheet', 'Dialog', 'Loading', 'LoadingBar', 'Notify', 'Dark'],
    extras: {
      font: 'roboto-font',
    },
  },
});
