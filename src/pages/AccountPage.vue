<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import FormField from '../components/FormField.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()
const route = useRoute()

const activeTab = ref((route.query.tab as string) || 'profile')
const tabs = [
  { key: 'profile',  label: '👤 Profile' },
  { key: 'password', label: '🔒 Password' },
  { key: 'security', label: '🛡️ Security' },
]

// Profile
const profile = reactive({
  firstName: 'Ahmad',
  lastName:  'Al-Rashid',
  email:     'ahmad@travelco.com',
  phone:     '+971 50 123 4567',
  jobTitle:  'Agency Administrator',
})

// Password
const pwForm = reactive({ current: '', newPw: '', confirm: '' })
const pwErrors = reactive<Record<string, string>>({})

// Security
const sessions = ref([
  { id: 'S1', device: 'Chrome on macOS', location: 'Dubai, UAE',    lastSeen: 'Active now',    current: true },
  { id: 'S2', device: 'Firefox on Windows', location: 'London, UK', lastSeen: '2 hours ago',  current: false },
  { id: 'S3', device: 'Safari on iPhone',   location: 'Dubai, UAE', lastSeen: '1 day ago',    current: false },
])

const saving = ref(false)
const changingPw = ref(false)

async function saveProfile() {
  saving.value = true
  await new Promise(r => setTimeout(r, 900))
  saving.value = false
  show('Profile updated successfully.', 'success')
}

async function changePassword() {
  Object.keys(pwErrors).forEach(k => delete pwErrors[k])
  if (!pwForm.current) pwErrors.current = 'Enter your current password'
  if (!pwForm.newPw || pwForm.newPw.length < 8) pwErrors.newPw = 'New password must be at least 8 characters'
  if (pwForm.newPw !== pwForm.confirm) pwErrors.confirm = 'Passwords do not match'
  if (Object.keys(pwErrors).length) return

  changingPw.value = true
  await new Promise(r => setTimeout(r, 1000))
  changingPw.value = false
  show('Password changed successfully.', 'success')
  pwForm.current = ''
  pwForm.newPw = ''
  pwForm.confirm = ''
}

function revokeSession(id: string) {
  sessions.value = sessions.value.filter(s => s.id !== id)
  show('Session revoked.', 'warning')
}
</script>

<template>
  <div>
    <PageHeader title="My Account" subtitle="Manage your personal profile and security settings" />

    <div class="layout">
      <!-- Sidebar -->
      <nav class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { 'tab-btn--active': activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </nav>

      <!-- Panels -->
      <BaseCard padding="lg" class="tab-panel">
        <!-- Profile -->
        <template v-if="activeTab === 'profile'">
          <div class="profile-hero">
            <div class="profile-avatar">{{ profile.firstName[0] }}{{ profile.lastName[0] }}</div>
            <div>
              <p class="profile-name">{{ profile.firstName }} {{ profile.lastName }}</p>
              <p class="profile-role">Agency Administrator</p>
            </div>
          </div>
          <h2 class="panel-title">Personal Information</h2>
          <div class="form-grid">
            <FormField label="First Name" required>
              <BaseInput v-model="profile.firstName" />
            </FormField>
            <FormField label="Last Name" required>
              <BaseInput v-model="profile.lastName" />
            </FormField>
            <FormField label="Email Address">
              <BaseInput v-model="profile.email" type="email" />
            </FormField>
            <FormField label="Phone">
              <BaseInput v-model="profile.phone" />
            </FormField>
            <FormField label="Job Title" class="col-span-2">
              <BaseInput v-model="profile.jobTitle" />
            </FormField>
          </div>
          <div class="panel-footer">
            <BaseButton variant="primary" :loading="saving" @click="saveProfile">Save Profile</BaseButton>
          </div>
        </template>

        <!-- Password -->
        <template v-else-if="activeTab === 'password'">
          <h2 class="panel-title">Change Password</h2>
          <div class="form-stack">
            <FormField label="Current Password" required :error="pwErrors.current">
              <BaseInput v-model="pwForm.current" type="password" placeholder="••••••••" :error="pwErrors.current" />
            </FormField>
            <FormField label="New Password" required :error="pwErrors.newPw">
              <BaseInput v-model="pwForm.newPw" type="password" placeholder="Min. 8 characters" :error="pwErrors.newPw" />
            </FormField>
            <FormField label="Confirm New Password" required :error="pwErrors.confirm">
              <BaseInput v-model="pwForm.confirm" type="password" placeholder="Repeat new password" :error="pwErrors.confirm" />
            </FormField>
          </div>
          <div class="panel-footer">
            <BaseButton variant="primary" :loading="changingPw" @click="changePassword">Update Password</BaseButton>
          </div>
        </template>

        <!-- Security -->
        <template v-else>
          <h2 class="panel-title">Active Sessions</h2>
          <p class="panel-sub">These devices are currently logged into your account. Revoke any you don't recognise.</p>
          <div class="session-list">
            <div v-for="session in sessions" :key="session.id" class="session-row">
              <div class="session-icon">💻</div>
              <div class="session-info">
                <p class="session-device">
                  {{ session.device }}
                  <span v-if="session.current" class="current-badge">Current</span>
                </p>
                <p class="session-meta">{{ session.location }} · {{ session.lastSeen }}</p>
              </div>
              <BaseButton
                v-if="!session.current"
                variant="danger"
                size="sm"
                @click="revokeSession(session.id)"
              >Revoke</BaseButton>
            </div>
          </div>
        </template>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--space-5);
  align-items: start;
}
@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
}

.tab-nav {
  display: flex; flex-direction: column; gap: var(--space-1);
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-2); box-shadow: var(--shadow-sm);
}
.tab-btn {
  text-align: left; padding: var(--space-2) var(--space-3);
  border: none; background: none; cursor: pointer;
  font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-muted);
  border-radius: var(--radius-md); transition: background 0.15s, color 0.15s;
  font-family: inherit;
}
.tab-btn:hover { background: var(--color-surface-hover); color: var(--color-text); }
.tab-btn--active { background: var(--color-primary-light); color: var(--color-primary); }

.tab-panel { min-height: 400px; }

.profile-hero {
  display: flex; align-items: center; gap: var(--space-4);
  margin-bottom: var(--space-6); padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}
.profile-avatar {
  width: 64px; height: 64px; border-radius: var(--radius-full);
  background: var(--color-primary); color: var(--color-text-inverse);
  font-size: var(--font-size-xl); font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.profile-name { font-size: var(--font-size-lg); font-weight: 700; color: var(--color-text); margin: 0; }
.profile-role { font-size: var(--font-size-sm); color: var(--color-text-muted); margin: 4px 0 0; }

.panel-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--color-text); margin: 0 0 var(--space-5); }
.panel-sub   { font-size: var(--font-size-sm); color: var(--color-text-muted); margin: calc(-1 * var(--space-3)) 0 var(--space-5); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.col-span-2 { grid-column: span 2; }
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .col-span-2 { grid-column: span 1; }
}
.form-stack { display: flex; flex-direction: column; gap: var(--space-4); max-width: 420px; }

.panel-footer { margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--color-border); }

.session-list { display: flex; flex-direction: column; }
.session-row {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-4) 0; border-bottom: 1px solid var(--color-border);
}
.session-row:last-child { border-bottom: none; }
.session-icon { font-size: 1.25rem; flex-shrink: 0; }
.session-info { flex: 1; }
.session-device { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text); margin: 0; display: flex; align-items: center; gap: var(--space-2); }
.session-meta   { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 2px 0 0; }
.current-badge {
  font-size: var(--font-size-xs); font-weight: 600;
  padding: 1px var(--space-2); border-radius: var(--radius-full);
  background: var(--color-success-light); color: var(--color-success);
}
</style>
