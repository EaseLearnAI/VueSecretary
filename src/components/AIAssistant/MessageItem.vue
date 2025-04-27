<template>
  <div class="message-container" :class="message.type">
    <div class="message-avatar">
      <div class="avatar-icon">
        <font-awesome-icon :icon="message.type === 'user' ? 'user' : 'robot'" />
      </div>
    </div>
    <div class="message-content">
      <div class="message-text">
        <p>{{ message.content }}</p>
      </div>
      
      <!-- Display ResultCards if the message has cards data -->
      <result-cards
        v-if="message.cards"
        :events="message.cards.events || []"
        :tasks="message.cards.tasks || []"
        :habits="message.cards.habits || []"
        @update:event="$emit('update:event', $event)"
        @update:task="$emit('update:task', $event)"
        @update:habit="$emit('update:habit', $event)"
      />
      
      <div class="message-timestamp">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import ResultCards from './ResultCards.vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.type && value.content && value.timestamp;
    }
  }
});

const emits = defineEmits(['update:event', 'update:task', 'update:habit', 'import-data']);

// Format timestamp to a readable time
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  
  // For messages from today, only show time
  const today = new Date();
  const isToday = date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
  
  // Format options
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  const dateTimeOptions = { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  };
  
  return date.toLocaleString('zh-CN', isToday ? timeOptions : dateTimeOptions);
};
</script>

<style scoped>
.message-container {
  display: flex;
  margin-bottom: 16px;
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-container.user {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 12px;
  align-self: flex-start;
}

.avatar-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.message-container.user .avatar-icon {
  background-color: var(--app-secondary, #6c757d);
}

.message-container.ai .avatar-icon {
  background-color: var(--app-primary, #007bff);
}

.message-content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 4px;
  position: relative;
}

.message-container.user .message-text {
  background-color: var(--app-primary, #007bff);
  color: white;
  border-top-right-radius: 4px;
  text-align: right;
}

.message-container.ai .message-text {
  background-color: white;
  color: var(--app-dark, #343a40);
  border-top-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-text p {
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-timestamp {
  font-size: 12px;
  color: var(--app-gray, #6c757d);
  margin-top: 4px;
  opacity: 0.8;
}

.message-container.user .message-timestamp {
  text-align: right;
}
</style> 