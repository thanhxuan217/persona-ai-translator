<template>
  <div class="persona-switcher glass border-b border-white/5">
    <div class="flex items-center gap-2 px-3 py-2.5 relative">
      <!-- Active persona info -->
      <button
        @click="showDropdown = !showDropdown"
        class="flex items-center gap-2 flex-1 min-w-0 text-left hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors"
      >
        <div class="pulse-dot flex-shrink-0"></div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold text-slate-100 truncate">
            {{ activePersona?.name || 'No Persona' }}
          </div>
          <div class="text-[10px] text-slate-400 truncate">
            {{ activePersona?.domain }} · {{ activePersona?.style }}
          </div>
        </div>
        <svg
          class="w-4 h-4 text-slate-400 transition-transform flex-shrink-0"
          :class="{ 'rotate-180': showDropdown }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Action buttons -->
      <button
        @click="$emit('edit')"
        class="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-accent-purple transition-colors"
        title="Chỉnh sửa Persona"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        @click="$emit('create')"
        class="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-accent-cyan transition-colors"
        title="Tạo Persona mới"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>

    <!-- Dropdown list -->
    <Transition name="fade">
      <div
        v-if="showDropdown"
        class="absolute left-2 right-2 z-50 glass-light rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
        :style="{ top: '54px' }"
      >
        <div class="max-h-60 overflow-y-auto py-1">
          <button
            v-for="p in personas"
            :key="p.id"
            @click="selectPersona(p.id)"
            class="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-white/5 transition-colors"
            :class="{ 'bg-accent-purple/10': p.id === activePersona?.id }"
          >
            <div
              class="w-2 h-2 rounded-full flex-shrink-0"
              :class="p.id === activePersona?.id ? 'bg-green-400' : 'bg-slate-600'"
            ></div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium truncate" :class="p.id === activePersona?.id ? 'text-accent-purple' : 'text-slate-200'">
                {{ p.name }}
              </div>
              <div class="text-[10px] text-slate-500 truncate">
                {{ p.target_lang }} · {{ p.domain }}
              </div>
            </div>
            <svg v-if="p.id === activePersona?.id" class="w-4 h-4 text-accent-purple flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="showDropdown"
      @click="showDropdown = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  personas: { type: Array, default: () => [] },
  activePersona: { type: Object, default: null }
})

const emit = defineEmits(['switch', 'create', 'edit'])
const showDropdown = ref(false)

function selectPersona(id) {
  emit('switch', id)
  showDropdown.value = false
}
</script>

<style scoped>
.persona-switcher {
  position: relative;
  z-index: 30;
}
</style>
