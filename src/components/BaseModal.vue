<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}>()
const emit = defineEmits<{ close: [] }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
        <div :class="['modal', `modal--${size || 'md'}`]" role="dialog" :aria-modal="true" :aria-label="title">
          <div class="modal__header">
            <h2 class="modal__title">{{ title }}</h2>
            <button class="modal__close" @click="emit('close')" aria-label="Close">
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          <div class="modal__body"><slot /></div>
          <div v-if="$slots.footer" class="modal__footer"><slot name="footer" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgb(0 0 0 / 0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
}
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.modal--sm { max-width: 400px; }
.modal--md { max-width: 560px; }
.modal--lg { max-width: 760px; }
.modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.modal__title { font-size: var(--font-size-lg); font-weight: 600; color: var(--color-text); margin: 0; }
.modal__close { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: var(--space-1); border-radius: var(--radius-sm); }
.modal__close:hover { background: var(--color-surface-hover); }
.modal__body { padding: var(--space-6); overflow-y: auto; }
.modal__footer { padding: var(--space-4) var(--space-6); border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: var(--space-3); flex-shrink: 0; }

.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: translateY(-16px); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s; }
</style>

