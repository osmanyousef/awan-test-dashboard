<script setup lang="ts">
import { ref, reactive } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSelect from '../components/BaseSelect.vue'
import BaseModal from '../components/BaseModal.vue'
import FormField from '../components/FormField.vue'
import StatusPill from '../components/StatusPill.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

interface MarkupRule {
  id: string
  name: string
  type: 'flat' | 'percentage'
  value: number
  applies_to: 'flight' | 'hotel' | 'all'
  status: 'Active' | 'Inactive'
}

const rules = ref<MarkupRule[]>([
  { id: 'MR-001', name: 'Standard Flight Markup',   type: 'percentage', value: 5,   applies_to: 'flight', status: 'Active' },
  { id: 'MR-002', name: 'Hotel Base Markup',         type: 'percentage', value: 8,   applies_to: 'hotel',  status: 'Active' },
  { id: 'MR-003', name: 'Flat Processing Fee',       type: 'flat',       value: 15,  applies_to: 'all',    status: 'Active' },
  { id: 'MR-004', name: 'Premium Flight Surcharge',  type: 'flat',       value: 50,  applies_to: 'flight', status: 'Inactive' },
])

const showModal = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)
const deleteTarget = ref<MarkupRule | null>(null)

const blankForm = (): { name: string; type: 'flat' | 'percentage'; value: string; applies_to: 'all' | 'flight' | 'hotel' } =>
  ({ name: '', type: 'percentage', value: '', applies_to: 'all' })
const form = reactive(blankForm())
const errors = reactive<Record<string, string>>({})

function openAdd() {
  editingId.value = null
  Object.assign(form, blankForm())
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function openEdit(rule: MarkupRule) {
  editingId.value = rule.id
  form.name = rule.name
  form.type = rule.type as typeof form.type
  form.value = String(rule.value)
  form.applies_to = rule.applies_to as typeof form.applies_to
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
    errors.value = 'Enter a valid positive number'
  if (form.type === 'percentage' && Number(form.value) > 100)
    errors.value = 'Percentage cannot exceed 100'
  return Object.keys(errors).length === 0
}

async function handleSave() {
  if (!validate()) return
  submitting.value = true
  await new Promise(r => setTimeout(r, 800))
  submitting.value = false

  if (editingId.value) {
    const idx = rules.value.findIndex(r => r.id === editingId.value)
    if (idx > -1) {
      rules.value[idx] = {
        ...rules.value[idx],
        name: form.name,
        type: form.type,
        value: Number(form.value),
        applies_to: form.applies_to,
      }
    }
    show('Markup rule updated.', 'success')
  } else {
    const id = `MR-${String(rules.value.length + 1).padStart(3, '0')}`
    rules.value.push({ id, name: form.name, type: form.type, value: Number(form.value), applies_to: form.applies_to, status: 'Active' })
    show('Markup rule created.', 'success')
  }
  showModal.value = false
}

function toggleStatus(rule: MarkupRule) {
  rule.status = rule.status === 'Active' ? 'Inactive' : 'Active'
  show(`Rule "${rule.name}" ${rule.status === 'Active' ? 'activated' : 'deactivated'}.`, 'info')
}

function confirmDelete(rule: MarkupRule) {
  deleteTarget.value = rule
}

function handleDelete() {
  if (!deleteTarget.value) return
  rules.value = rules.value.filter(r => r.id !== deleteTarget.value!.id)
  show(`Rule "${deleteTarget.value.name}" deleted.`, 'warning')
  deleteTarget.value = null
}

function formatValue(rule: MarkupRule) {
  return rule.type === 'percentage' ? `${rule.value}%` : `$${rule.value}`
}

const typeOptions = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'flat',       label: 'Flat Amount ($)' },
]
const appliesToOptions = [
  { value: 'all',    label: 'All Bookings' },
  { value: 'flight', label: 'Flights only' },
  { value: 'hotel',  label: 'Hotels only' },
]
</script>

<template>
  <div>
    <PageHeader title="Markup Rules" subtitle="Configure markup applied to bookings for your agency">
      <template #actions>
        <BaseButton variant="primary" @click="openAdd">+ Add Rule</BaseButton>
      </template>
    </PageHeader>

    <BaseCard padding="none" class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Rule Name</th>
            <th>Type</th>
            <th>Value</th>
            <th>Applies To</th>
            <th>Status</th>
            <th class="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="rules.length === 0">
            <td colspan="7" class="empty">No markup rules defined. Click "+ Add Rule" to create one.</td>
          </tr>
          <tr v-for="rule in rules" :key="rule.id" class="table-row">
            <td class="mono muted">{{ rule.id }}</td>
            <td class="rule-name">{{ rule.name }}</td>
            <td>
              <span :class="['type-badge', `type-badge--${rule.type}`]">
                {{ rule.type === 'percentage' ? '% Percent' : '$ Flat' }}
              </span>
            </td>
            <td class="value-col">{{ formatValue(rule) }}</td>
            <td class="muted">
              {{ rule.applies_to === 'all' ? 'All' : rule.applies_to === 'flight' ? '✈ Flights' : '🏨 Hotels' }}
            </td>
            <td>
              <StatusPill :status="rule.status" size="sm" />
            </td>
            <td class="right">
              <div class="actions">
                <BaseButton variant="ghost" size="sm" @click="openEdit(rule)">Edit</BaseButton>
                <BaseButton
                  :variant="rule.status === 'Active' ? 'secondary' : 'ghost'"
                  size="sm"
                  @click="toggleStatus(rule)"
                >
                  {{ rule.status === 'Active' ? 'Disable' : 'Enable' }}
                </BaseButton>
                <BaseButton variant="danger" size="sm" @click="confirmDelete(rule)">Delete</BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseCard>

    <!-- Add/Edit Modal -->
    <BaseModal
      :open="showModal"
      :title="editingId ? 'Edit Markup Rule' : 'Add Markup Rule'"
      size="sm"
      @close="showModal = false"
    >
      <form @submit.prevent="handleSave" class="form">
        <FormField label="Rule Name" required :error="errors.name">
          <BaseInput v-model="form.name" placeholder="e.g. Standard Flight Markup" :error="errors.name" />
        </FormField>
        <FormField label="Type" required>
          <BaseSelect v-model="form.type" :options="typeOptions" />
        </FormField>
        <FormField label="Value" required :error="errors.value">
          <BaseInput
            v-model="form.value"
            type="number"
            :placeholder="form.type === 'percentage' ? 'e.g. 5' : 'e.g. 20'"
            :suffix="form.type === 'percentage' ? '%' : 'USD'"
            :error="errors.value"
          />
        </FormField>
        <FormField label="Applies To" required>
          <BaseSelect v-model="form.applies_to" :options="appliesToOptions" />
        </FormField>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="submitting" @click="handleSave">
          {{ editingId ? 'Save Changes' : 'Create Rule' }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- Delete confirmation -->
    <BaseModal :open="!!deleteTarget" title="Delete Markup Rule" size="sm" @close="deleteTarget = null">
      <p class="delete-msg">
        Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>?
        This action cannot be undone.
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="deleteTarget = null">Cancel</BaseButton>
        <BaseButton variant="danger" @click="handleDelete">Delete Rule</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.table-card { overflow: hidden; }
.table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
.table th {
  padding: var(--space-3) var(--space-4);
  text-align: left; font-weight: 600; font-size: var(--font-size-xs);
  color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border); background: var(--color-bg);
  white-space: nowrap;
}
.table th.right { text-align: right; }
.table-row td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.table-row:hover { background: var(--color-surface-hover); }
.table-row:last-child td { border-bottom: none; }
.empty { text-align: center; padding: var(--space-8); color: var(--color-text-muted); }

.mono { font-family: monospace; font-size: var(--font-size-xs); }
.muted { color: var(--color-text-muted); }
.rule-name { font-weight: 500; }
.value-col { font-weight: 600; font-variant-numeric: tabular-nums; }
.right { text-align: right; }

.type-badge {
  display: inline-flex; align-items: center;
  font-size: var(--font-size-xs); font-weight: 500;
  padding: 2px var(--space-2); border-radius: var(--radius-sm);
}
.type-badge--percentage { background: var(--color-info-light); color: var(--color-info); }
.type-badge--flat       { background: var(--color-warning-light); color: var(--color-accent-hover); }

.actions { display: flex; gap: var(--space-2); justify-content: flex-end; flex-wrap: wrap; }

.form { display: flex; flex-direction: column; gap: var(--space-4); }
.delete-msg { color: var(--color-text); font-size: var(--font-size-sm); line-height: 1.6; margin: 0; }
</style>


