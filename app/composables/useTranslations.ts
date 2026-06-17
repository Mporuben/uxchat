import { onMounted } from 'vue';
export async function useTranslation() {
  const { data: translations } = await useAsyncData('translations', () => queryCollection('translations').first());

  function t(key: string, fallback?: string): string {
    const keys = key.split('.');
    if (!translations?.value?.meta) {
      return 'translation-not-loaded';
    }
    let value: unknown = translations.value.meta;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return fallback ?? key;
      }
    }

    return typeof value === 'string' ? value : (fallback ?? key);
  }

  return { t };
}

export interface ChatMessage {
  id: number;
  message: string;
  createdAt: Date;
}
