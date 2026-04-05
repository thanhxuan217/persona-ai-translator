<template>
  <div class="flex flex-col h-full">
    <!-- Chat area -->
    <ChatWindow
      class="flex-1 overflow-hidden"
      :messages="displayMessages"
      :isStreaming="ollama.isStreaming.value"
      :streamingText="ollama.streamingText.value"
      welcomeText="Xin chào! Tôi sẽ giúp bạn tạo một Persona dịch thuật cá nhân qua vài câu hỏi ngắn."
    >
      <template #after-messages>
        <QuickChips
          v-if="!ollama.isStreaming.value && currentChips.length > 0"
          :chips="currentChips"
          @select="onChipSelect"
        />
      </template>
    </ChatWindow>

    <!-- Input -->
    <ChatInput
      ref="inputRef"
      :disabled="ollama.isStreaming.value"
      placeholder="Trả lời câu hỏi..."
      @send="onUserSend"
    />

    <!-- Cancel button -->
    <div v-if="displayMessages.length > 0" class="flex justify-center pb-2">
      <button
        @click="$emit('cancel')"
        class="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1"
      >
        Bỏ qua, dùng mặc định →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ConversationManager } from '@/lib/conversation-manager'
import ChatWindow from './ChatWindow.vue'
import ChatInput from './ChatInput.vue'
import QuickChips from './QuickChips.vue'

const props = defineProps({
  ollama: { type: Object, required: true },
  editTarget: { type: Object, default: null }
})

const emit = defineEmits(['persona-created', 'cancel'])

// ---- State ----
const conversation = new ConversationManager()
const displayMessages = ref([])
const currentChips = ref([])
const inputRef = ref(null)

// ---- Lifecycle ----
onMounted(async () => {
  conversation.reset('interview')
  await startInterview()
})

// ---- Methods ----
async function startInterview() {
  // Let AI generate the first greeting question
  try {
    const messages = conversation.getMessages()
    // Add a trigger to get the first message
    if (props.editTarget) {
      conversation.addMessage('user', `Xin chào, tôi muốn chỉnh sửa Persona dịch thuật hiện tại tên là "${props.editTarget.name}". Ngôn ngữ đích đang là ${props.editTarget.target_lang}, chuyên ngành ${props.editTarget.domain}, văn phong ${props.editTarget.style}. Hãy hỏi tôi muốn thay đổi điều gì.`)
    } else {
      conversation.addMessage('user', 'Xin chào, tôi muốn tạo Persona dịch thuật mới.')
    }
    displayMessages.value = []

    const fullText = await props.ollama.streamChat(
      conversation.getMessages(),
      null
    )

    conversation.addMessage('assistant', fullText)

    // Show AI message (clean) but don't show the initial trigger user message
    displayMessages.value = [{
      role: 'assistant',
      content: conversation.cleanDisplayText(fullText),
      timestamp: Date.now()
    }]

    // Detect chips
    currentChips.value = ConversationManager.detectChips(fullText)
  } catch (err) {
    displayMessages.value = [{
      role: 'assistant',
      content: 'Xin chào! 👋 Tôi sẽ giúp bạn tạo Persona dịch thuật. Trước hết, **ngôn ngữ đích** bạn muốn dịch tới thường xuyên nhất là gì?',
      timestamp: Date.now()
    }]
    currentChips.value = ['Tiếng Việt', 'English', '日本語', '中文', '한국어']
  }

  nextTick(() => inputRef.value?.focus())
}

async function onUserSend(text) {
  // Add user message to display
  displayMessages.value.push({
    role: 'user',
    content: text,
    timestamp: Date.now()
  })

  // Add to conversation
  conversation.addMessage('user', text)
  currentChips.value = []

  try {
    // Stream AI response
    const fullText = await props.ollama.streamChat(
      conversation.getMessages(),
      null
    )

    conversation.addMessage('assistant', fullText)

    // Check for persona update command
    const personaData = conversation.extractPersonaUpdate(fullText)
    const cleanText = conversation.cleanDisplayText(fullText)

    // Add AI response to display
    displayMessages.value.push({
      role: 'assistant',
      content: cleanText,
      timestamp: Date.now()
    })

    if (personaData) {
      // Interview complete! Emit persona data
      setTimeout(() => {
        emit('persona-created', personaData)
      }, 1500) // Short delay to let user read the summary
    } else {
      // Detect chips for next question
      currentChips.value = ConversationManager.detectChips(fullText)
    }
  } catch (err) {
    displayMessages.value.push({
      role: 'assistant',
      content: `⚠️ Lỗi kết nối: ${err.message}. Vui lòng kiểm tra Ollama server.`,
      timestamp: Date.now()
    })
  }

  nextTick(() => inputRef.value?.focus())
}

function onChipSelect(chipText) {
  onUserSend(chipText)
}
</script>
