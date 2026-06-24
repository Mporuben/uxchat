import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

export function useTyping(input) {
  const { $trpc } = useNuxtApp();

  const typingUsers = ref<Set<string>>(new Set());
  const error = ref<Error | null>(null);

  let typingSubscription: { unsubscribe: () => void } | null = null;
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  const isTyping = computed(() => typingUsers.value.size > 0);

  async function setTyping(isTyping: boolean) {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }

    try {
      await $trpc.messages.typing.mutate({
        isTyping,
      });
    } catch (e) {
      console.error('Failed to send typing indicator:', e);
    }
  }

  function subscribeToTyping() {
    typingSubscription = $trpc.messages.onTyping.subscribe(undefined, {
      onData: ({ username, isTyping }) => {
        if (isTyping) {
          typingUsers.value.add(username);
        } else {
          typingUsers.value.delete(username);
        }
        // Force reactivity
        typingUsers.value = new Set(typingUsers.value);
      },
      onError: (err) => {
        console.error('Typing subscription error:', err);
      },
    });
  }

  function cleanup() {
    typingSubscription?.unsubscribe();
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  }

  // Watch input for typing indicator with debounce
  watch(input, async (value) => {
    if (input.value === '') {
      // Clear typing indicator
      setTyping(false);
    }

    if (value.trim()) {
      setTyping(true);

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set typing to false after 2 seconds of inactivity
      typingTimeout = setTimeout(() => {
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
    }
  });

  // Auto-initialize when mounted
  onMounted(async () => {
    subscribeToTyping();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup();
  });

  return {
    error,
    typingUsers,
    isTyping,
    setTyping,
    cleanup,
  };
}

export interface ChatMessage {
  id: number;
  message: string;
  createdAt: Date;
}
