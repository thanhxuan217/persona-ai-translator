<template>
  <div class="chat-input glass border-t border-white/5">
    <div class="flex items-end gap-2 p-2.5">
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="text"
          @input="autoResize"
          @keydown="onKeyDown"
          :placeholder="placeholder"
          :disabled="disabled"
          rows="1"
          class="input-area"
        ></textarea>
      </div>
      <button
        @click="send"
        :disabled="disabled || !text.trim()"
        class="send-btn"
        :class="{ 'can-send': text.trim() && !disabled }"
      >
        <svg v-if="!disabled" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m-7 7l7-7 7 7" />
        </svg>
        <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  placeholder: { type: String, default: 'Nhập tin nhắn...' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['send'])

const text = ref('')
const textareaRef = ref(null)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function onKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function send() {
  const msg = text.value.trim()
  if (!msg || props.disabled) return
  emit('send', msg)
  text.value = ''
  nextTick(autoResize)
}

function focus() {
  textareaRef.value?.focus()
}

function setText(val) {
  text.value = val
  nextTick(autoResize)
}

defineExpose({ focus, setText })
</script>

<style scoped>
.chat-input {
  flex-shrink: 0;
}

.input-area {
  width: 100%;
  padding: 8px 12px;
  background: rgba(15, 15, 26, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  max-height: 120px;
}

.input-area:focus {
  border-color: rgba(139, 92, 246, 0.4);
}

.input-area::placeholder {
  color: rgba(148, 163, 184, 0.4);
}

.input-area:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(139, 92, 246, 0.15);
  color: rgba(139, 92, 246, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn.can-send {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white;
}

.send-btn.can-send:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.send-btn:disabled {
  cursor: not-allowed;
}
</style>
