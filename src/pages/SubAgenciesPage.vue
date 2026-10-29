<script setup lang="ts">
import { ref, reactive } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseModal from '../components/BaseModal.vue'
import FormField from '../components/FormField.vue'
import StatusPill from '../components/StatusPill.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

interface SubAgency {
  id: string
  name: string
  email: string
  country: string
  bookingsCount: number
  status: 'Active' | 'Inactive'
}

const agencies = ref<SubAgency[]>([
  { id: 'SA-001', name: 'Nomad Agency',    email: 'contact@nomadagency.com', country: 'UAE',     bookingsCount: 42, status: 'Active' },
  { id: 'SA-002', name: 'Blue Sky Travel', email: 'info@bluesky.travel',      country: 'UK',      bookingsCount: 18, status: 'Active' },
  { id: 'SA-003', name: 'Apex Tours',      email: 'ops@apextours.com',        country: 'France',  bookingsCount: 29, status: 'Active' },
  { id: 'SA-004', name: 'Global Trips',    email: 'hello@globaltrips.io',     country: 'Germany', bookingsCount: 7,  status: 'Inactive' },
])

const showModal = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)

const blankForm = () => ({ name: '', email: '', country: '' })
const form = reactive(blankForm())
const errors = reactive<Record<string, string>>({})

function openAdd() {
  editingId.value = null
  Object.assign(form, blankForm())
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function openEdit(agency: SubAgency) {
  editingId.value = agency.id
  form.name    = agency.name
  form.email   = agency.email
  form.country = agency.country
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim())    errors.name    = 'Name is required'
  if (!form.email.trim())   errors.email   = 'Email is required'
  if (!form.country.trim()) errors.country = 'Country is required'
  return Object.keys(errors).length === 0
}

async function handleSave() {
  if (!validate()) return
  submitting.value = true
  await new Promise(r => setTimeout(r, 800))
  submitting.value = false

  if (editingId.value) {
    const idx = agencies.value.findIndex(a => a.id === editingId.value)
    if (idx > -1) Object.assign(agencies.value[idx], { name: form.name, email: form.email, country: form.country })
    show('Sub-agency updated.', 'success')
  } else {
    const id = `SA-${String(agencies.value.length + 1).padStart(3, '0')}`
    agencies.value.push({ id, ...form, bookingsCount: 0, status: 'Active' })
    show('Sub-agency invited.', 'success')
  }
  showModal.value = false
}

function toggleStatus(agency: SubAgency) {
  agency.status = agency.status === 'Active' ? 'Inactive' : 'Active'
  show(`${agency.name} ${agency.status === 'Active' ? 'activated' : 'deactivated'}.`, 'info')
}
</script>

<template>
  <div>
    <PageHeader title="Sub-Agencies" subtitle="Manage your sub-agency network">
      <template #actions>
        <BaseButton variant="primary" @click="openAdd">+ Invite Sub-Agency</BaseButton>
      </template>
    </PageHeader>

    <div class="agencies-grid">
      <BaseCard v-for="agency in agencies" :key="agency.id" padding="md" class="agency-card">
        <div class="agency-header">
          <div class="agency-avatar">{{ agency.name.charAt(0) }}</div>
          <div class="agency-info">
            <p class="agency-name">{{ agency.name }}</p>
            <p class="agency-id">{{ agency.id }}</p>
          </div>
          <StatusPill :status="agency.status" size="sm" class="agency-status" />
        </div>
        <div class="agency-details">
          <p class="detail-row"><span class="detail-icon">📧</span>{{ agency.email }}</p>
          <p class="detail-row"><span class="detail-icon">🌍</span>{{ agency.country }}</p>
          <p class="detail-row"><span class="detail-icon">🗂️</span>{{ agency.bookingsCount }} bookings</p>
        </div>
        <div class="agency-actions">
          <BaseButton variant="ghost" size="sm" @click="openEdit(agency)">Edit</BaseButton>
          <BaseButton
            :variant="agency.status === 'Active' ? 'secondary' : 'ghost'"
            size="sm"
            @click="toggleStatus(agency)"
          >{{ agency.status === 'Active' ? 'Deactivate' : 'Activate' }}</BaseButton>
        </div>
      </BaseCard>
    </div>

    <BaseModal :open="showModal" :title="editingId ? 'Edit Sub-Agency' : 'Invite Sub-Agency'" size="sm" @close="showModal = false">
      <form @submit.prevent="handleSave" class="form">
        <FormField label="Agency Name" required :error="errors.name">
          <BaseInput v-model="form.name" placeholder="e.g. Nomad Agency" :error="errors.name" />
        </FormField>
        <FormField label="Contact Email" required :error="errors.email">
          <BaseInput v-model="form.email" type="email" placeholder="contact@agency.com" :error="errors.email" />
        </FormField>
        <FormField label="Country" required :error="errors.country">
          <BaseInput v-model="form.country" placeholder="e.g. UAE" :error="errors.country" />
        </FormField>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="submitting" @click="handleSave">
          {{ editingId ? 'Save' : 'Send Invite' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.agencies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}
.agency-card { display: flex; flex-direction: column; gap: var(--space-4); }
.agency-header { display: flex; align-items: center; gap: var(--space-3); }
.agency-avatar {
  width: 40px; height: 40px; border-radius: var(--radius-full);
  background: var(--color-primary-light); color: var(--color-primary);
  font-size: var(--font-size-lg); font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.agency-info { flex: 1; min-width: 0; }
.agency-name { font-weight: 600; color: var(--color-text); margin: 0; font-size: var(--font-size-base); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.agency-id   { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0; font-family: monospace; }
.agency-status { flex-shrink: 0; }
.agency-details { display: flex; flex-direction: column; gap: var(--space-1); }
.detail-row { display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-sm); color: var(--color-text-muted); margin: 0; }
.detail-icon { font-size: 0.875rem; }
.agency-actions { display: flex; gap: var(--space-2); padding-top: var(--space-2); border-top: 1px solid var(--color-border); }
.form { display: flex; flex-direction: column; gap: var(--space-4); }
</style>

