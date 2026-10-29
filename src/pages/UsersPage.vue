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

type Role = 'Admin' | 'Booking Agent' | 'Finance' | 'Viewer'
interface User {
  id: string
  name: string
  email: string
  role: Role
  lastLogin: string
  status: 'Active' | 'Inactive'
}

const users = ref<User[]>([
  { id: 'U001', name: 'Ahmad Al-Rashid', email: 'ahmad@travelco.com',  role: 'Admin',         lastLogin: '2025-10-29', status: 'Active' },
  { id: 'U002', name: 'Sara Patel',       email: 'sara@travelco.com',   role: 'Booking Agent', lastLogin: '2025-10-28', status: 'Active' },
  { id: 'U003', name: 'James Wilson',     email: 'james@travelco.com',  role: 'Finance',       lastLogin: '2025-10-27', status: 'Active' },
  { id: 'U004', name: 'Mia Chen',         email: 'mia@travelco.com',    role: 'Viewer',        lastLogin: '2025-10-10', status: 'Inactive' },
])

const showModal = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)

const blankForm = () => ({ name: '', email: '', role: 'Booking Agent' as Role })
const form = reactive(blankForm())
const errors = reactive<Record<string, string>>({})

const roleOptions = [
  { value: 'Admin',         label: 'Admin' },
  { value: 'Booking Agent', label: 'Booking Agent' },
  { value: 'Finance',       label: 'Finance' },
  { value: 'Viewer',        label: 'Viewer' },
]

function openAdd() {
  editingId.value = null
  Object.assign(form, blankForm())
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function openEdit(user: User) {
  editingId.value = user.id
  form.name  = user.name
  form.email = user.email
  form.role  = user.role
  Object.keys(errors).forEach(k => delete errors[k])
  showModal.value = true
}

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim())  errors.name  = 'Name is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  return Object.keys(errors).length === 0
}

async function handleSave() {
  if (!validate()) return
  submitting.value = true
  await new Promise(r => setTimeout(r, 800))
  submitting.value = false

  if (editingId.value) {
    const idx = users.value.findIndex(u => u.id === editingId.value)
    if (idx > -1) Object.assign(users.value[idx], { name: form.name, email: form.email, role: form.role })
    show('User updated.', 'success')
  } else {
    const id = `U${String(users.value.length + 1).padStart(3, '0')}`
    users.value.push({ id, ...form, lastLogin: '—', status: 'Active' })
    show('User invited successfully.', 'success')
  }
  showModal.value = false
}

function toggleStatus(user: User) {
  user.status = user.status === 'Active' ? 'Inactive' : 'Active'
  show(`${user.name} ${user.status === 'Active' ? 'activated' : 'deactivated'}.`, 'info')
}

function formatDate(d: string) {
  if (d === '—') return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const roleColors: Record<Role, string> = {
  'Admin':         'role--admin',
  'Booking Agent': 'role--agent',
  'Finance':       'role--finance',
  'Viewer':        'role--viewer',
}
</script>

<template>
  <div>
    <PageHeader title="Users" subtitle="Manage who has access to your agency dashboard">
      <template #actions>
        <BaseButton variant="primary" @click="openAdd">+ Invite User</BaseButton>
      </template>
    </PageHeader>

    <BaseCard padding="none" class="table-card">
      <table class="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Last Login</th>
            <th>Status</th>
            <th class="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="table-row">
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ user.name.split(' ').map(n => n[0]).join('').slice(0,2) }}</div>
                <div>
                  <p class="user-name">{{ user.name }}</p>
                  <p class="user-email">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td><span :class="['role-badge', roleColors[user.role]]">{{ user.role }}</span></td>
            <td class="muted">{{ formatDate(user.lastLogin) }}</td>
            <td><StatusPill :status="user.status" size="sm" /></td>
            <td class="right">
              <div class="actions">
                <BaseButton variant="ghost" size="sm" @click="openEdit(user)">Edit</BaseButton>
                <BaseButton
                  :variant="user.status === 'Active' ? 'secondary' : 'ghost'"
                  size="sm"
                  @click="toggleStatus(user)"
                >{{ user.status === 'Active' ? 'Deactivate' : 'Activate' }}</BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </BaseCard>

    <BaseModal :open="showModal" :title="editingId ? 'Edit User' : 'Invite User'" size="sm" @close="showModal = false">
      <form @submit.prevent="handleSave" class="form">
        <FormField label="Full Name" required :error="errors.name">
          <BaseInput v-model="form.name" placeholder="e.g. Sara Patel" :error="errors.name" />
        </FormField>
        <FormField label="Email Address" required :error="errors.email">
          <BaseInput v-model="form.email" type="email" placeholder="user@agency.com" :error="errors.email" />
        </FormField>
        <FormField label="Role" required>
          <BaseSelect v-model="form.role" :options="roleOptions" />
        </FormField>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="submitting" @click="handleSave">
          {{ editingId ? 'Save Changes' : 'Send Invite' }}
        </BaseButton>
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
  border-bottom: 1px solid var(--color-border); background: var(--color-bg); white-space: nowrap;
}
.table th.right { text-align: right; }
.table-row td { padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.table-row:hover { background: var(--color-surface-hover); }
.table-row:last-child td { border-bottom: none; }
.right { text-align: right; }
.muted { color: var(--color-text-muted); }

.user-cell { display: flex; align-items: center; gap: var(--space-3); }
.user-avatar {
  width: 36px; height: 36px; border-radius: var(--radius-full);
  background: var(--color-primary-light); color: var(--color-primary);
  font-size: var(--font-size-xs); font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-name  { font-weight: 500; color: var(--color-text); margin: 0; }
.user-email { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 0; }

.role-badge {
  font-size: var(--font-size-xs); font-weight: 500;
  padding: 2px var(--space-2); border-radius: var(--radius-sm);
}
.role--admin   { background: var(--color-danger-light);  color: var(--color-danger); }
.role--agent   { background: var(--color-info-light);    color: var(--color-info); }
.role--finance { background: var(--color-success-light); color: var(--color-success); }
.role--viewer  { background: var(--color-surface-hover); color: var(--color-text-muted); border: 1px solid var(--color-border); }

.actions { display: flex; gap: var(--space-2); justify-content: flex-end; }
.form { display: flex; flex-direction: column; gap: var(--space-4); }
</style>
