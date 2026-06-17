<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';

const messagesContainer = ref<HTMLElement | null>(null);
const user = useLogtoUser();

const { t } = await useTranslation();

const { messages, input, isLoading, sendMessage } = useMessages();

const { typingUsers, isTyping } = useTyping(input);

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

async function scrollToBottom() {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

const typingText = computed(() => {
  const users = Array.from(typingUsers.value);
  if (users.length === 0) return '';
  if (users.length === 1) return `${users[0]} is typing...`;
  if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`;
  return `${users.slice(0, 2).join(', ')} and ${users.length - 2} others are typing...`;
});

async function handleSend() {
  await sendMessage();
  await scrollToBottom();
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
}

// Scroll to bottom when messages change
watch(messages, () => scrollToBottom(), { deep: true });

// Initial scroll
watch(isLoading, (loading) => {
  if (!loading) scrollToBottom();
});
</script>

<template>
  <q-page class="column">
    <q-toolbar class="page-header">
      <q-toolbar-title>UX Chat</q-toolbar-title>

      <q-btn flat round>
        <q-avatar size="32px" color="primary" text-color="white">
          {{ user?.username[0] }}
        </q-avatar>

        <q-menu anchor="top right" self="bottom right">
          <q-item clickable v-close-popup>
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>{{ t('user.dropdown') }}</q-item-section>
          </q-item>
        </q-menu>
      </q-btn>
    </q-toolbar>

    <div ref="messagesContainer" class="col q-pa-md messages-container">
      <div v-if="isLoading" class="text-center q-pa-lg">
        <q-spinner-dots size="40px" color="primary" />
      </div>

      <div v-else-if="messages.length === 0" class="text-center q-pa-lg text-grey">
        {{ t('chat.noMessages') }}
      </div>

      <div v-else>
        <div v-for="message in messages" :key="message.id" class="message-row q-mb-md">
          <q-avatar size="36px" class="q-mr-sm">
            <img src="https://cdn.quasar.dev/img/avatar1.jpg" />
          </q-avatar>
          <div class="message-content">
            <div class="message-header">
              <span class="text-weight-bold">{{ message.author }}</span>
              <span class="text-caption text-grey q-ml-sm">{{ formatTime(message.createdAt) }}</span>
            </div>
            <div class="message-text">{{ message.message }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isTyping" class="q-px-md typing-indicator">
      <span class="text-caption text-grey">{{ typingText }}</span>
    </div>

    <div class="q-pa-md">
      <q-input
        v-model="input"
        type="textarea"
        outlined
        dense
        autogrow
        :placeholder="t('chat.messageInputPlaceholder')"
        class="full-width"
        @keydown="handleKeydown"
      >
        <template #append>
          <q-icon
            name="send"
            class="cursor-pointer"
            :class="input.trim() ? 'text-primary' : 'text-grey'"
            @click="handleSend"
          />
        </template>
      </q-input>
    </div>
  </q-page>
</template>

<style scoped>
.page-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
}

.messages-container {
  overflow-y: auto;
  flex: 1;
}

.message-row {
  display: flex;
  align-items: flex-start;
}

.message-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  align-items: baseline;
}

.message-text {
  margin-top: 2px;
  line-height: 1.4;
}

.typing-indicator {
  height: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
