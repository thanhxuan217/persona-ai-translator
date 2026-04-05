<template>
  <div class="chat-bubble bubble-enter" :class="[isUser ? 'user-msg' : 'ai-msg']">
    <!-- AI Avatar -->
    <div v-if="!isUser" class="avatar-container">
      <div class="avatar">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a4 4 0 014 4v1h1a3 3 0 013 3v2a3 3 0 01-3 3h-1v2a4 4 0 01-8 0v-2H7a3 3 0 01-3-3v-2a3 3 0 013-3h1V6a4 4 0 014-4z"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
          <path d="M9 14h6" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Message Content -->
    <div class="bubble-content" :class="[isUser ? 'user-bubble' : 'ai-bubble']">
      <div class="message-text" v-html="renderedContent"></div>
      <div v-if="message.timestamp" class="message-time">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
    // { role: 'user'|'assistant', content: string, timestamp?: number }
  }
})

const isUser = computed(() => props.message.role === 'user')

const renderedContent = computed(() => {
  let text = props.message.content || ''
  // Remove persona update commands from display
  text = text.replace(/\[UPDATE_PERSONA:\s*\{[\s\S]*?\}\]/g, '')
  // Basic markdown-like formatting
  text = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, '<br>')
  return text.trim()
})

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.chat-bubble {
  display: flex;
  gap: 8px;
  padding: 2px 12px;
  margin: 4px 0;
}

.user-msg {
  flex-direction: row-reverse;
}

.avatar-container {
  flex-shrink: 0;
  padding-top: 2px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white;
}

.bubble-content {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.55;
  position: relative;
}

.ai-bubble {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-top-left-radius: 4px;
  color: #e2e8f0;
}

.user-bubble {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-top-right-radius: 4px;
  color: #f1f5f9;
}

.message-text :deep(strong) {
  color: #c4b5fd;
  font-weight: 600;
}

.message-text :deep(.inline-code) {
  background: rgba(139, 92, 246, 0.15);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #a5b4fc;
}

.message-time {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.5);
  margin-top: 4px;
  text-align: right;
}
</style>
