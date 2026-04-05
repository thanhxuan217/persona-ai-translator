<template>
  <div v-if="chips.length" class="quick-chips px-3 py-2">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="(chip, i) in chips"
        :key="chip"
        @click="$emit('select', chip)"
        class="chip animate-chip-in"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        {{ chip }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  chips: { type: Array, default: () => [] }
})

defineEmits(['select'])
</script>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
}

.chip:hover {
  background: rgba(139, 92, 246, 0.18);
  border-color: rgba(139, 92, 246, 0.4);
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.2);
  color: #ddd6fe;
}

.chip:active {
  transform: translateY(0) scale(0.98);
}

.animate-chip-in {
  animation: chipIn 0.4s ease-out backwards;
}

@keyframes chipIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
