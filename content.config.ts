import { defineContentConfig, defineCollection } from '@nuxt/content';

export const collections = {
  translations: defineCollection({
    type: 'page',
    source: 'en-US.yml',
  }),
};
