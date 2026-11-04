<script setup lang="ts">
interface Props {
  cancelFee?: number | null
  changeFee?: number | null
  isCancellable?: boolean
  isChangeable?: boolean
}

withDefaults(defineProps<Props>(), {
  cancelFee: 130,
  changeFee: 70,
  isCancellable: true,
  isChangeable: true,
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-[#d3dff1] p-5 sm:p-6 shadow-xs">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
      <h2 class="text-lg font-bold text-[#0c1f44] m-0">Cancellation &amp; change policy</h2>
      <div class="flex items-center gap-2">
        <span
          v-if="isCancellable"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e5f6ee] text-[#0d8a58]"
        >
          <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Cancellation available
        </span>
        <span
          v-if="isChangeable"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e5f6ee] text-[#0d8a58]"
        >
          <svg class="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Change available
        </span>
      </div>
    </div>

    <!-- Policy Rows -->
    <dl class="space-y-3 text-xs text-[#3d4a66] m-0">
      <div class="flex items-center justify-between py-2 border-b border-[#eef3fa]">
        <dt class="font-normal text-[#3d4a66]">Cancellation &amp; refund, before departure</dt>
        <dd class="font-mono font-semibold text-[#0c1f44] m-0">
          {{ isCancellable && cancelFee ? `approx. $${cancelFee.toFixed(2)}` : 'Non-refundable' }}
        </dd>
      </div>

      <div class="flex items-center justify-between py-2 border-b border-[#eef3fa]">
        <dt class="font-normal text-[#3d4a66]">Date change, before departure</dt>
        <dd class="font-mono font-semibold text-[#0c1f44] m-0">
          {{ isChangeable && changeFee ? `approx. $${changeFee.toFixed(2)}` : 'Changes not permitted' }}
        </dd>
      </div>

      <div class="flex items-center justify-between py-2">
        <dt class="font-normal text-[#63708b]">No-show policy</dt>
        <dd class="font-medium text-[#b42318] m-0">Non-refundable after scheduled departure</dd>
      </div>
    </dl>

    <!-- Info Notice -->
    <div class="mt-4 p-3 rounded-xl bg-[#eef3fa] text-xs text-[#63708b] flex items-start gap-2.5">
      <svg class="w-4 h-4 stroke-current stroke-2 fill-none text-[#4a6cc0] shrink-0 mt-0.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span>
        Airline fare rules and penalty terms apply. Fees shown are per passenger and may vary based on exchange rates and carrier policies at the time of processing.
      </span>
    </div>
  </div>
</template>

