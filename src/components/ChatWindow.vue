<template>
  <div class="chat-window" ref="scrollContainer">
    <div class="chat-messages pb-2">
      <!-- Welcome message if empty -->
      <div v-if="messages.length === 0 && !isStreaming" class="welcome-screen">
        <div class="welcome-icon">
          <svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#8b5cf6"/>
                <stop offset="100%" stop-color="#06b6d4"/>
              </linearGradient>
            </defs>
            <circle cx="24" cy="24" r="22" stroke="url(#wg)" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M24 8a8 8 0 018 8v2h2a6 6 0 016 6v4a6 6 0 01-6 6h-2v4a8 8 0 01-16 0v-4h-2a6 6 0 01-6-6v-4a6 6 0 016-6h2v-2a8 8 0 018-8z" fill="url(#wg)" opacity="0.15"/>
            <circle cx="19" cy="22" r="2" fill="url(#wg)"/>
            <circle cx="29" cy="22" r="2" fill="url(#wg)"/>
            <path d="M19 28h10" stroke="url(#wg)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="gradient-text text-lg font-bold mt-3">Persona Agent</h3>
        <p class="text-slate-500 text-xs mt-1 px-6 text-center">
          {{ welcomeText }}
        </p>
      </div>

      <!-- Chat messages -->
      <ChatBubble
        v-for="(msg, i) in messages"
        :key="i"
        :message="msg"
      />

      <!-- Streaming message (AI typing) -->
      <div v-if="isStreaming && streamingText" class="chat-bubble ai-msg bubble-enter" style="display:flex;gap:8px;padding:2px 12px;margin:4px 0;">
        <div style="flex-shrink:0;padding-top:2px;">
          <div class="avatar" style="width:28px;height:28px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:white;">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a4 4 0 014 4v1h1a3 3 0 013 3v2a3 3 0 01-3 3h-1v2a4 4 0 01-8 0v-2H7a3 3 0 01-3-3v-2a3 3 0 013-3h1V6a4 4 0 014-4z"/>
              <circle cx="9" cy="10" r="1" fill="currentColor"/>
              <circle cx="15" cy="10" r="1" fill="currentColor"/>
              <path d="M9 14h6" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        <div class="streaming-bubble" v-html="formatStreaming(streamingText)"></div>
      </div>

      <!-- Typing indicator (before first chunk) -->
      <div v-if="isStreaming && !streamingText" class="flex gap-2 px-3 py-2">
        <div style="width:28px;height:28px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:white;flex-shrink:0;">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a4 4 0 014 4v1h1a3 3 0 013 3v2a3 3 0 01-3 3h-1v2a4 4 0 01-8 0v-2H7a3 3 0 01-3-3v-2a3 3 0 013-3h1V6a4 4 0 014-4z"/>
          </svg>
        </div>
        <div class="typing-dots" style="padding:10px 14px;background:rgba(26,26,46,0.8);border:1px solid rgba(139,92,246,0.15);border-radius:16px;">
          <span></span><span></span><span></span>
        </div>
      </div>

      <slot name="after-messages"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import ChatBubble from './ChatBubble.vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  isStreaming: { type: Boolean, default: false },
  streamingText: { type: String, default: '' },
  welcomeText: { type: String, default: 'Sẵn sàng hỗ trợ bạn dịch thuật thông minh.' }
})

const scrollContainer = ref(null)

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

function formatStreaming(text) {
  return text
    .replace(/\[UPDATE_PERSONA:\s*\{[\s\S]*?\}\]/g, '')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c4b5fd">$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(139,92,246,0.15);padding:1px 5px;border-radius:4px;font-size:12px;color:#a5b4fc">$1</code>')
    .replace(/\n/g, '<br>')
}

// Auto-scroll on new messages or streaming
watch(() => props.messages.length, scrollToBottom)
watch(() => props.streamingText, scrollToBottom)
watch(() => props.isStreaming, scrollToBottom)
onMounted(scrollToBottom)
</script>

<style scoped>
.chat-window {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.chat-messages {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  flex: 1;
  opacity: 0.8;
}

.welcome-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.streaming-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  border-top-left-radius: 4px;
  font-size: 13px;
  line-height: 1.55;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.15);
  color: #e2e8f0;
}
</style>
