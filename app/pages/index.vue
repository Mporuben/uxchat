<script setup lang="ts">
import { ref, nextTick } from 'vue';

interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: Date;
}

const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const messages = ref<Message[]>([
  {
    id: '1',
    user: 'Alice Johnson',
    avatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
    content: 'Hey team! How is the new feature coming along?',
    timestamp: new Date('2024-01-15T09:30:00'),
  },
  {
    id: '2',
    user: 'Bob Smith',
    avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
    content: 'Making good progress! Should have the first draft ready by EOD.',
    timestamp: new Date('2024-01-15T09:32:00'),
  },
  {
    id: '3',
    user: 'Alice Johnson',
    avatar: 'https://cdn.quasar.dev/img/avatar1.jpg',
    content: 'That sounds great! Let me know if you need any help with the design specs.',
    timestamp: new Date('2024-01-15T09:35:00'),
  },
  {
    id: '4',
    user: 'Charlie Davis',
    avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
    content: 'I can help with the API integration once the frontend is ready. Just ping me!',
    timestamp: new Date('2024-01-15T09:40:00'),
  },
]);

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

async function sendMessage() {
  if (!newMessage.value.trim()) return;

  const message: Message = {
    id: Date.now().toString(),
    user: 'You',
    avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
    content: newMessage.value,
    timestamp: new Date(),
  };

  messages.value.push(message);
  newMessage.value = '';

  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}
</script>

<template>
  <q-page class="column">
    <q-toolbar class="page-header">
      <q-toolbar-title>UX Chat</q-toolbar-title>

      <q-btn flat round>
        <q-avatar size="32px">
          <img src="https://cdn.quasar.dev/img/avatar4.jpg" />
        </q-avatar>

        <q-menu anchor="top right" self="bottom right">
          <q-item clickable v-close-popup>
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-menu>
      </q-btn>
    </q-toolbar>

    <div ref="messagesContainer" class="col q-pa-md messages-container">
      <div v-for="message in messages" :key="message.id" class="message-row q-mb-md">
        <q-avatar size="36px" class="q-mr-sm">
          <img :src="message.avatar" />
        </q-avatar>
        <div class="message-content">
          <div class="message-header">
            <span class="text-weight-bold">{{ message.user }}</span>
            <span class="text-caption text-grey q-ml-sm">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="message-text">{{ message.content }}</div>
        </div>
      </div>
    </div>

    <div class="q-pa-md">
      <q-input
        v-model="newMessage"
        type="textarea"
        outlined
        dense
        autogrow
        placeholder="Message #general"
        class="full-width"
        @keydown="handleKeydown"
      >
        <template #append>
          <q-icon
            name="send"
            class="cursor-pointer"
            :class="newMessage.trim() ? 'text-primary' : 'text-grey'"
            @click="sendMessage"
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
</style>
