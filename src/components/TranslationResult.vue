<template>
  <div v-if="translated" class="translation-result mx-3 mb-2 animate-slide-up">
    <div class="result-card glass-light rounded-xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span class="text-[10px] font-semibold uppercase tracking-wider text-accent-purple">Kết quả dịch</span>
        <div class="flex gap-1">
          <button @click="$emit('copy')" class="action-btn" title="Copy">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button @click="$emit('retranslate')" class="action-btn" title="Dịch lại">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Source text (collapsed) -->
      <div v-if="source" class="px-3 py-2 border-b border-white/5">
        <div class="text-[10px] text-slate-500 mb-0.5">Nguồn</div>
        <div class="text-xs text-slate-400 line-clamp-2">{{ source }}</div>
      </div>

      <!-- Translated text -->
      <div class="px-3 py-3">
        <div class="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">{{ translated }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  source: { type: String, default: '' },
  translated: { type: String, default: '' }
})

defineEmits(['copy', 'retranslate'])
</script>

<style scoped>
.result-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.1);
}

.action-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: rgba(139, 92, 246, 0.15);
  color: #c4b5fd;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
