<template>
  <div id="persona-agent" class="flex flex-col h-screen bg-surface-900 overflow-hidden">
    <!-- Persona Switcher Header -->
    <PersonaSwitcher
      :personas="personas"
      :activePersona="activePersona"
      @switch="onSwitchPersona"
      @create="onCreatePersona"
      @edit="onEditPersona"
    />

    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden relative">
      <!-- Connection Error Banner -->
      <div
        v-if="connectionError"
        class="absolute top-0 inset-x-0 z-10 px-3 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs flex items-center gap-2"
      >
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span class="flex-1">{{ connectionError }}</span>
        <button @click="retryConnection" class="text-red-300 hover:text-white text-xs underline">Retry</button>
      </div>

      <InterviewMode
        v-if="currentMode === 'interview'"
        :key="interviewKey"
        :ollama="ollama"
        :editTarget="editTarget"
        @persona-created="onPersonaCreated"
        @cancel="currentMode = 'translation'"
      />

      <TranslationMode
        v-else
        :ollama="ollama"
        :activePersona="activePersona"
        :pendingTranslation="pendingTranslation"
        @clear-pending="clearPending"
        @persona-updated="onPersonaUpdated"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useOllama } from '@/composables/useOllama'
import { usePersona } from '@/composables/usePersona'
import { useChrome } from '@/composables/useChrome'
import PersonaSwitcher from '@/components/PersonaSwitcher.vue'
import InterviewMode from '@/components/InterviewMode.vue'
import TranslationMode from '@/components/TranslationMode.vue'

// ---- State ----
const currentMode = ref('translation')
const connectionError = ref('')
const editTarget = ref(null)
const interviewKey = ref(0)

// ---- Composables ----
const ollama = useOllama()
const { personas, activePersona, loadPersonas, switchPersona, savePersona } = usePersona()
const { pendingTranslation, clearPending } = useChrome()

// ---- Lifecycle ----
onMounted(async () => {
  await loadPersonas()

  // Check if first time (no custom personas) → start interview
  if (personas.value.length <= 1 && personas.value[0]?.id === 'default') {
    currentMode.value = 'interview'
  }

  // Init Ollama client from active persona config
  initOllamaFromPersona()
})

// ---- Watchers ----
watch(activePersona, () => {
  initOllamaFromPersona()
})

// When text is selected and we're in interview mode, switch to translation
watch(pendingTranslation, (val) => {
  if (val && currentMode.value === 'interview') {
    // Don't interrupt interview
  } else if (val) {
    currentMode.value = 'translation'
  }
})

// ---- Methods ----
function initOllamaFromPersona() {
  const p = activePersona.value
  if (!p) return
  const url = p.config?.url || 'http://localhost:11434'
  const model = p.config?.model || 'translategemma:latest'
  ollama.initClient(url, model)
  checkConnection()
}

async function checkConnection() {
  const ok = await ollama.checkConnection()
  connectionError.value = ok
    ? ''
    : 'Không thể kết nối Ollama. Kiểm tra server tại ' + (activePersona.value?.config?.url || 'localhost:11434')
}

function retryConnection() {
  connectionError.value = ''
  checkConnection()
}

function onSwitchPersona(id) {
  switchPersona(id)
}

function onCreatePersona() {
  editTarget.value = null
  interviewKey.value++
  currentMode.value = 'interview'
}

function onEditPersona() {
  editTarget.value = activePersona.value
  interviewKey.value++
  currentMode.value = 'interview'
}

async function onPersonaCreated(personaData) {
  if (editTarget.value) {
    personaData.id = editTarget.value.id
  }
  await savePersona(personaData)
  currentMode.value = 'translation'
}

async function onPersonaUpdated(personaData) {
  await savePersona(personaData)
}
</script>
