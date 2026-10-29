<script setup lang="ts">
import { ref, reactive } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import FormField from '../components/FormField.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const form = reactive({
  amount: '',
  reason: '',
  urgency: 'standard',
  notes: '',
})
const errors = reactive<Record<string, string>>({})
const submitting = ref(false)

const previousRequests = [
  { id: 'CR-001', date: '2025-10-15', amount: 20000, status: 'Approved',  notes: 'Monthly top-up' },
  { id: 'CR-002', date: '2025-09-28', amount: 15000, status: 'Approved',  notes: 'Event bookings surge' },
  { id: 'CR-003', date: '2025-09-01', amount: 8000,  status: 'Rejected',  notes: 'Insufficient documentation' },
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
    errors.amount = 'Please enter a valid amount greater than 0'
  if (!form.reason.trim())
    errors.reason = 'Please provide a reason for the credit request'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  await new Promise(r => setTimeout(r, 1200))
  submitting.value = false
  show(`Credit request for ${formatCurrency(Number(form.amount))} submitted successfully.`, 'success')
  form.amount = ''
  form.reason = ''
  form.urgency = 'standard'
  form.notes = ''
}
</script>

<template>
  <div>
    <PageHeader title="Request Credit" subtitle="Submit a credit top-up request for your agency wallet" />

    <div class="layout">
      <!-- Form -->
      <BaseCard padding="lg" class="form-card">
        <h2 class="form-title">New Credit Request</h2>
        <form @submit.prevent="handleSubmit" class="form">
          <FormField label="Amount (USD)" required :error="errors.amount">
            <BaseInput
              v-model="form.amount"
              type="number"
              placeholder="e.g. 10000"
              prefix="$"
              :error="errors.amount"
            />
          </FormField>

          <FormField label="Reason" required :error="errors.reason">
            <BaseInput
              v-model="form.reason"
              placeholder="e.g. Monthly top-up for upcoming bookings"
              :error="errors.reason"
            />
          </FormField>

          <FormField label="Urgency">
            <div class="radio-group">
              <label v-for="opt in [{ value: 'standard', label: 'Standard (3-5 days)' }, { value: 'urgent', label: 'Urgent (24h)' }]" :key="opt.value" class="radio-label">
                <input type="radio" v-model="form.urgency" :value="opt.value" class="radio-input" />
                {{ opt.label }}
              </label>
            </div>
          </FormField>

          <FormField label="Additional Notes">
            <textarea
              v-model="form.notes"
              class="textarea"
              placeholder="Any additional context for the finance team..."
              rows="3"
            />
          </FormField>

          <div class="form-actions">
            <BaseButton type="submit" :loading="submitting" :disabled="submitting" variant="primary" size="lg">
              Submit Request
            </BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- History -->
      <div class="history-panel">
        <BaseCard padding="none">
          <div class="panel-head">
            <h3 class="panel-head__title">Previous Requests</h3>
          </div>
          <div class="history-list">
            <div v-for="req in previousRequests" :key="req.id" class="history-item">
              <div class="history-item__top">
                <span class="history-item__id">{{ req.id }}</span>
                <span :class="['status-badge', `status-badge--${req.status.toLowerCase()}`]">{{ req.status }}</span>
              </div>
              <p class="history-item__amount">{{ formatCurrency(req.amount) }}</p>
              <p class="history-item__meta">{{ formatDate(req.date) }} · {{ req.notes }}</p>
            </div>
          </div>
        </BaseCard>

        <BaseCard padding="md" class="info-card">
          <h4 class="info-title">ℹ️ How It Works</h4>
          <ol class="info-list">
            <li>Submit your credit request with the required amount and reason.</li>
            <li>Our finance team reviews within the urgency window you selected.</li>
            <li>Once approved, funds are credited to your wallet automatically.</li>
          </ol>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--space-5);
  align-items: start;
}
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
}

.form-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--color-text); margin: 0 0 var(--space-5); }
.form { display: flex; flex-direction: column; gap: var(--space-4); }
.form-actions { padding-top: var(--space-2); }

.radio-group { display: flex; gap: var(--space-5); flex-wrap: wrap; }
.radio-label { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-sm); cursor: pointer; }
.radio-input { accent-color: var(--color-primary); }

.textarea {
  width: 100%; padding: 9px var(--space-3);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  font-size: var(--font-size-sm); font-family: inherit; color: var(--color-text);
  resize: vertical; background: var(--color-surface);
  box-sizing: border-box;
}
.textarea:focus { outline: none; border-color: var(--color-border-focus); box-shadow: 0 0 0 3px var(--color-primary-light); }

.history-panel { display: flex; flex-direction: column; gap: var(--space-4); }
.panel-head { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border); }
.panel-head__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text); margin: 0; }
.history-list { padding: var(--space-2) 0; }
.history-item { padding: var(--space-3) var(--space-5); border-bottom: 1px solid var(--color-border); }
.history-item:last-child { border-bottom: none; }
.history-item__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.history-item__id { font-size: var(--font-size-xs); font-weight: 600; color: var(--color-text-muted); }
.history-item__amount { font-size: var(--font-size-base); font-weight: 700; color: var(--color-text); margin: 0 0 2px; }
.history-item__meta { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0; }

.status-badge {
  font-size: var(--font-size-xs); font-weight: 500;
  padding: 2px var(--space-2); border-radius: var(--radius-full);
}
.status-badge--approved { background: var(--color-success-light); color: var(--color-success); }
.status-badge--rejected { background: var(--color-danger-light); color: var(--color-danger); }
.status-badge--pending  { background: var(--color-warning-light); color: var(--color-accent-hover); }

.info-card {}
.info-title { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text); margin: 0 0 var(--space-3); }
.info-list { margin: 0; padding-left: var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-muted); }
.info-list li { margin-bottom: var(--space-2); line-height: 1.5; }
</style>
