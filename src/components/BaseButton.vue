<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})

defineEmits<{ click: [e: MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--full': fullWidth, 'btn--loading': loading }]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
  white-space: nowrap;
}
.btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn--full { width: 100%; }

/* Sizes */
.btn--sm { font-size: var(--font-size-sm); padding: 6px var(--space-3); }
.btn--md { font-size: var(--font-size-sm); padding: 9px var(--space-4); }
.btn--lg { font-size: var(--font-size-base); padding: 11px var(--space-5); }

/* Variants */
.btn--primary { background: var(--color-primary); color: var(--color-text-inverse); border-color: var(--color-primary); }
.btn--primary:not(:disabled):hover { background: var(--color-primary-hover); border-color: var(--color-primary-hover); }

.btn--secondary { background: var(--color-surface); color: var(--color-text); border-color: var(--color-border); }
.btn--secondary:not(:disabled):hover { background: var(--color-surface-hover); }

.btn--ghost { background: transparent; color: var(--color-primary); border-color: transparent; }
.btn--ghost:not(:disabled):hover { background: var(--color-primary-light); }

.btn--danger { background: var(--color-danger); color: var(--color-text-inverse); border-color: var(--color-danger); }
.btn--danger:not(:disabled):hover { opacity: 0.88; }

/* Spinner */
.btn__spinner {
  width: 14px; height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

