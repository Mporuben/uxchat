import { ref, onMounted, onUnmounted } from 'vue';

export function useMessages() {
  const { $trpc } = useNuxtApp();

  const messages = ref<ChatMessage[]>([]);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);
  const input = ref('');

  // Subscriptions and timers
  let newMessageSubscription: { unsubscribe: () => void } | null = null;
  let typingSubscription: { unsubscribe: () => void } | null = null;
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  // Methods
  async function fetchMessages() {
    try {
      isLoading.value = true;
      error.value = null;
      const result = await $trpc.messages.get.query({ limit: 50 });
      messages.value = result.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      }));
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to fetch messages');
      console.error('Failed to fetch messages:', e);
    }
    isLoading.value = false;
  }

  async function sendMessage(content?: string) {
    const messageContent = content ?? input.value;
    if (!messageContent.trim()) return;

    // Clear input immediately for better UX
    const previousInput = input.value;
    input.value = '';

    try {
      const result = await $trpc.messages.post.mutate({
        message: messageContent.trim(),
      });

      // Add the message to local list
      messages.value.push({
        ...result,
        createdAt: new Date(result.createdAt),
      });

      return result;
    } catch (e) {
      // Restore input on error
      input.value = previousInput;
      error.value = e instanceof Error ? e : new Error('Failed to send message');
      console.error('Failed to send message:', e);
      throw e;
    }
  }

  function subscribeToMessages() {
    newMessageSubscription = $trpc.messages.on.subscribe(undefined, {
      onData: (message) => {
        // Avoid duplicates
        if (!messages.value.find((m) => m.id === message.id)) {
          messages.value.push({
            ...message,
            createdAt: new Date(message.createdAt),
          });
        }
      },
      onError: (err) => {
        console.error('Message subscription error:', err);
      },
    });
  }

  function cleanup() {
    newMessageSubscription?.unsubscribe();
    typingSubscription?.unsubscribe();
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  }

  // Auto-initialize when mounted
  onMounted(async () => {
    await fetchMessages();
    subscribeToMessages();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup();
  });

  return {
    // State
    messages,
    input,
    isLoading,
    error,

    // Methods
    sendMessage,
    fetchMessages,
    cleanup,
  };
}

export interface ChatMessage {
  id: number;
  author: string;
  message: string;
  createdAt: Date;
}
