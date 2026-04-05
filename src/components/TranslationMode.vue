<template>
  <div class="flex flex-col h-full">
    <!-- Chat area -->
    <ChatWindow
      class="flex-1 overflow-hidden"
      :messages="displayMessages"
      :isStreaming="ollama.isStreaming.value"
      :streamingText="ollama.streamingText.value"
      welcomeText="Chọn text trên trang web hoặc nhập text cần dịch bên dưới."
    />

    <!-- Translation result card (if last message was a translation) -->
    <TranslationResult
      v-if="lastTranslation && !ollama.isStreaming.value"
      :source="lastTranslation.source"
      :translated="lastTranslation.translated"
      @copy="copyTranslation"
      @retranslate="retranslate"
    />

    <!-- Input -->
    <ChatInput
      ref="inputRef"
      :disabled="ollama.isStreaming.value"
      placeholder="Nhập text cần dịch hoặc yêu cầu..."
      @send="onUserSend"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { ConversationManager } from '@/lib/conversation-manager'
import ChatWindow from './ChatWindow.vue'
import ChatInput from './ChatInput.vue'
import TranslationResult from './TranslationResult.vue'

const props = defineProps({
  ollama: { type: Object, required: true },
  activePersona: { type: Object, default: null },
  pendingTranslation: { type: Object, default: null }
})

const emit = defineEmits(['clear-pending', 'persona-updated'])

// ---- State ----
const conversation = new ConversationManager()
const displayMessages = ref([])
const lastTranslation = ref(null)
const inputRef = ref(null)

// ---- Lifecycle ----
onMounted(() => {
  if (props.activePersona) {
    conversation.setTranslationMode(props.activePersona)
  }
  if (props.pendingTranslation) {
    handlePendingTranslation(props.pendingTranslation)
  }
})

// ---- Watchers ----
// When active persona changes, reset conversation
watch(() => props.activePersona, (p) => {
  if (p) {
    conversation.setTranslationMode(p)
    displayMessages.value = []
    lastTranslation.value = null
  }
}, { deep: true })

// When text is selected on page, auto-translate
const handlePendingTranslation = async (val) => {
  if (val && val.selectedText) {
    if (val.autoTranslate) {
      await translateText(val.selectedText, val.contextText)
    } else {
      nextTick(() => {
        inputRef.value?.setText(val.selectedText)
      })
    }
    emit('clear-pending')
  }
}

watch(() => props.pendingTranslation, handlePendingTranslation)

// ---- Methods ----
async function onUserSend(text) {
  // Add user message to display
  displayMessages.value.push({
    role: 'user',
    content: text,
    timestamp: Date.now()
  })

  // Detect if it's a translation request or a meta-command
  const isMetaCommand = isPersonaCommand(text)

  if (isMetaCommand) {
    // Handle as free chat (persona change request, etc.)
    conversation.addMessage('user', text)
    await streamResponse()
  } else {
    // Treat as translation request
    const prompt = conversation.buildTranslationPrompt(text)
    conversation.addMessage('user', prompt)
    lastTranslation.value = { source: text, translated: '' }
    await streamResponse(true)
  }

  nextTick(() => inputRef.value?.focus())
}

async function translateText(text, context = '') {
  displayMessages.value.push({
    role: 'user',
    content: `📋 "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`,
    timestamp: Date.now()
  })

  const prompt = conversation.buildTranslationPrompt(text, context)
  conversation.addMessage('user', prompt)
  lastTranslation.value = { source: text, translated: '' }
  await streamResponse(true)
}

async function streamResponse(isTranslation = false) {
  try {
    const fullText = await props.ollama.streamChat(
      conversation.getMessages(),
      null
    )

    conversation.addMessage('assistant', fullText)

    // Check for persona update
    const personaData = conversation.extractPersonaUpdate(fullText)
    const cleanText = conversation.cleanDisplayText(fullText)

    displayMessages.value.push({
      role: 'assistant',
      content: cleanText,
      timestamp: Date.now()
    })

    if (isTranslation && lastTranslation.value) {
      lastTranslation.value.translated = cleanText
    }

    if (personaData) {
      emit('persona-updated', personaData)
    }
  } catch (err) {
    displayMessages.value.push({
      role: 'assistant',
      content: `⚠️ Lỗi: ${err.message}`,
      timestamp: Date.now()
    })
    lastTranslation.value = null
  }
}

function isPersonaCommand(text) {
  const lower = text.toLowerCase()
  const keywords = ['đổi persona', 'tạo persona', 'thay đổi phong cách', 'change persona', 'change style', 'switch to', 'đổi ngôn ngữ', 'đổi lĩnh vực']
  return keywords.some(kw => lower.includes(kw))
}

function copyTranslation() {
  if (lastTranslation.value?.translated) {
    navigator.clipboard.writeText(lastTranslation.value.translated).catch(() => {})
  }
}

function retranslate() {
  if (lastTranslation.value?.source) {
    lastTranslation.value = null
    translateText(lastTranslation.value?.source || '')
  }
}
</script>
