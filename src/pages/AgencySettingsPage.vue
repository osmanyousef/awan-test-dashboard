<script setup lang="ts">
import { ref, reactive } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import BaseCard from '../components/BaseCard.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSelect from '../components/BaseSelect.vue'
import FormField from '../components/FormField.vue'
import { useToast } from '../composables/useToast'

const { show } = useToast()

const tabs = [
  { key: 'general',  label: 'General' },
  { key: 'billing',  label: 'Billing' },
  { key: 'notifications', label: 'Notifications' },
]
const activeTab = ref('general')

// General settings
const general = reactive({
  agencyName:    'Acme Travel Agency',
  tradingName:   'ATA',
  email:         'ops@acmetravel.com',
  phone:         '+971 4 123 4567',
  address:       'Office 1204, Business Bay, Dubai, UAE',
  defaultCurrency: 'USD',
})

// Billing settings
const billing = reactive({
  billingEmail:    'finance@acmetravel.com',
  vatNumber:       'AE123456789',
  paymentTerms:    '30',
})

// Notifications
const notifications = reactive({
  bookingConfirmed:   true,
  bookingCancelled:   true,
  amendmentRequest:   true,
  walletLow:         true,
  walletThreshold:   '5000',
  weeklyReport:      false,
})

const currencyOptions = [
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'AED', label: 'AED – UAE Dirham' },
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'EUR', label: 'EUR – Euro' },
]

const termOptions = [
  { value: '7',  label: 'Net 7 days' },
  { value: '14', label: 'Net 14 days' },
  { value: '30', label: 'Net 30 days' },
  { value: '60', label: 'Net 60 days' },
]

const saving = ref(false)

async function handleSave() {
  saving.value = true
  await new Promise(r => setTimeout(r, 900))
  saving.value = false
  show('Settings saved successfully.', 'success')
}
</script>

<template>
  <div>
    <PageHeader title="Agency Settings" subtitle="Manage your agency profile and preferences">
      <template #actions>
        <BaseButton variant="primary" :loading="saving" @click="handleSave">Save Changes</BaseButton>
      </template>
    </PageHeader>

    <div class="layout">
      <!-- Tab sidebar -->
      <nav class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { 'tab-btn--active': activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </nav>

      <!-- Tab panels -->
      <BaseCard padding="lg" class="tab-panel">
        <!-- General -->
        <template v-if="activeTab === 'general'">
          <h2 class="panel-title">General Information</h2>
          <div class="form-grid">
            <FormField label="Agency Name" required>
              <BaseInput v-model="general.agencyName" placeholder="Acme Travel Agency" />
            </FormField>
            <FormField label="Trading Name">
              <BaseInput v-model="general.tradingName" placeholder="ATA" />
            </FormField>
            <FormField label="Contact Email">
              <BaseInput v-model="general.email" type="email" />
            </FormField>
            <FormField label="Phone Number">
              <BaseInput v-model="general.phone" placeholder="+971 4 000 0000" />
            </FormField>
            <FormField label="Office Address" class="col-span-2">
              <BaseInput v-model="general.address" />
            </FormField>
            <FormField label="Default Currency">
              <BaseSelect v-model="general.defaultCurrency" :options="currencyOptions" />
            </FormField>
          </div>
        </template>

        <!-- Billing -->
        <template v-else-if="activeTab === 'billing'">
          <h2 class="panel-title">Billing & Payments</h2>
          <div class="form-grid">
            <FormField label="Billing Email" required>
              <BaseInput v-model="billing.billingEmail" type="email" />
            </FormField>
            <FormField label="VAT / Tax Number">
              <BaseInput v-model="billing.vatNumber" placeholder="AE123456789" />
            </FormField>
            <FormField label="Payment Terms">
              <BaseSelect v-model="billing.paymentTerms" :options="termOptions" />
            </FormField>
          </div>

          <div class="info-box">
            <p class="info-box__title">💳 Payment Methods</p>
            <p class="info-box__body">To add or change payment methods, please contact your account manager or email <a href="mailto:billing@b2btravel.com">billing@b2btravel.com</a>.</p>
          </div>
        </template>

        <!-- Notifications -->
        <template v-else>
          <h2 class="panel-title">Notification Preferences</h2>
          <div class="toggle-list">
            <div class="toggle-row">
              <div>
                <p class="toggle-label">Booking Confirmed</p>
                <p class="toggle-hint">Get notified when a booking is confirmed</p>
              </div>
              <button
                :class="['toggle', { 'toggle--on': notifications.bookingConfirmed }]"
                @click="notifications.bookingConfirmed = !notifications.bookingConfirmed"
                :aria-checked="notifications.bookingConfirmed"
                role="switch"
              ><span class="toggle__knob" /></button>
            </div>

            <div class="toggle-row">
              <div>
                <p class="toggle-label">Booking Cancelled</p>
                <p class="toggle-hint">Get notified when a booking is cancelled</p>
              </div>
              <button
                :class="['toggle', { 'toggle--on': notifications.bookingCancelled }]"
                @click="notifications.bookingCancelled = !notifications.bookingCancelled"
                role="switch" :aria-checked="notifications.bookingCancelled"
              ><span class="toggle__knob" /></button>
            </div>

            <div class="toggle-row">
              <div>
                <p class="toggle-label">Amendment Requests</p>
                <p class="toggle-hint">Get notified about new amendment requests</p>
              </div>
              <button
                :class="['toggle', { 'toggle--on': notifications.amendmentRequest }]"
                @click="notifications.amendmentRequest = !notifications.amendmentRequest"
                role="switch" :aria-checked="notifications.amendmentRequest"
              ><span class="toggle__knob" /></button>
            </div>

            <div class="toggle-row">
              <div>
                <p class="toggle-label">Low Wallet Balance Alert</p>
                <p class="toggle-hint">Alert when balance drops below threshold</p>
              </div>
              <button
                :class="['toggle', { 'toggle--on': notifications.walletLow }]"
                @click="notifications.walletLow = !notifications.walletLow"
                role="switch" :aria-checked="notifications.walletLow"
              ><span class="toggle__knob" /></button>
            </div>

            <div v-if="notifications.walletLow" class="toggle-row toggle-row--sub">
              <FormField label="Balance Threshold (USD)">
                <BaseInput v-model="notifications.walletThreshold" type="number" prefix="$" />
              </FormField>
            </div>

            <div class="toggle-row">
              <div>
                <p class="toggle-label">Weekly Summary Report</p>
                <p class="toggle-hint">Receive a weekly digest every Monday</p>
              </div>
              <button
                :class="['toggle', { 'toggle--on': notifications.weeklyReport }]"
                @click="notifications.weeklyReport = !notifications.weeklyReport"
                role="switch" :aria-checked="notifications.weeklyReport"
              ><span class="toggle__knob" /></button>
            </div>
          </div>
        </template>

        <div class="panel-footer">
          <BaseButton variant="primary" :loading="saving" @click="handleSave">Save Changes</BaseButton>
        </div>
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
@media (max-width: 768px) {
  .tab-nav { flex-direction: row; flex-wrap: wrap; }
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
.panel-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--color-text); margin: 0 0 var(--space-5); }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.col-span-2 { grid-column: span 2; }
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .col-span-2 { grid-column: span 1; }
}

.info-box {
  margin-top: var(--space-5); padding: var(--space-4);
  background: var(--color-info-light); border: 1px solid var(--color-info);
  border-radius: var(--radius-md);
}
.info-box__title { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-info); margin: 0 0 var(--space-2); }
.info-box__body  { font-size: var(--font-size-sm); color: var(--color-text); margin: 0; }
.info-box__body a { color: var(--color-primary); }

.toggle-list { display: flex; flex-direction: column; }
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-4) 0; border-bottom: 1px solid var(--color-border);
  gap: var(--space-4);
}
.toggle-row:last-child { border-bottom: none; }
.toggle-row--sub { justify-content: flex-start; padding-left: var(--space-4); background: var(--color-bg); border-radius: var(--radius-md); margin: calc(-1 * var(--space-2)) 0; }
.toggle-label { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text); margin: 0; }
.toggle-hint  { font-size: var(--font-size-xs); color: var(--color-text-muted); margin: 2px 0 0; }

.toggle {
  flex-shrink: 0;
  width: 44px; height: 24px; border-radius: var(--radius-full);
  border: none; cursor: pointer; background: var(--color-border);
  padding: 0; position: relative; transition: background 0.2s;
}
.toggle--on { background: var(--color-primary); }
.toggle__knob {
  display: block; width: 18px; height: 18px;
  border-radius: var(--radius-full); background: white;
  position: absolute; top: 3px; left: 3px;
  transition: transform 0.2s; box-shadow: var(--shadow-sm);
}
.toggle--on .toggle__knob { transform: translateX(20px); }

.panel-footer { margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px solid var(--color-border); }
</style>

