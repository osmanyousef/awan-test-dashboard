<script setup lang="ts">
import { useToast } from '../composables/useToast'
const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
          @click="remove(toast.id)"
        >
          <span class="toast__msg">{{ toast.message }}</span>
          <button class="toast__close" aria-label="Dismiss">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed; bottom: var(--space-6); right: var(--space-6);
  z-index: var(--z-toast);
  display: flex; flex-direction: column; gap: var(--space-2);
  pointer-events: none;
}
.toast {
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: var(--font-size-sm);
  pointer-events: auto;
  cursor: pointer;
  min-width: 260px; max-width: 380px;
  border-left: 4px solid;
  background: var(--color-surface);
  color: var(--color-text);
}
.toast--success { border-color: var(--color-success); }
.toast--error   { border-color: var(--color-danger); }
.toast--warning { border-color: var(--color-warning); }
.toast--info    { border-color: var(--color-info); }
.toast__msg { flex: 1; }
.toast__close { background: none; border: none; color: var(--color-text-muted); font-size: 1.2rem; cursor: pointer; padding: 0; line-height: 1; }
.toast-enter-from { opacity: 0; transform: translateX(24px); }
.toast-leave-to   { opacity: 0; transform: translateX(24px); }
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
</style>
