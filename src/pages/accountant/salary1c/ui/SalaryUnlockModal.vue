<script setup>
  import { ref, computed, watch } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useSalaryAccessStore } from '@/store/modules/accountant/salaryAccessStore.js'
  import {
    Checkmark16Regular,
    Dismiss16Regular,
    LockClosed20Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useSalaryAccessStore()

  const loginPassword = ref('')
  const oldPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  const password = ref('')

  // Modal ochilganda maydonlarni tozalaymiz.
  watch(
    () => store.visible,
    (v) => {
      if (v) {
        loginPassword.value = ''
        oldPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
        password.value = ''
      }
    }
  )

  // Rejim: 'change' (eski→yangi), 'set' (birinchi marta), 'unlock' (kirish).
  const mode = computed(() => {
    if (store.intent === 'change' && store.hasPassword) return 'change'
    return store.hasPassword ? 'unlock' : 'set'
  })
  const withNewPassword = computed(() => mode.value === 'set' || mode.value === 'change')

  const rules = computed(() => [
    { key: 'minLength', label: t('changePassword.rules.minLength'), valid: newPassword.value.length >= 8 },
    { key: 'uppercase', label: t('changePassword.rules.uppercase'), valid: /[A-Z]/.test(newPassword.value) },
    { key: 'lowercase', label: t('changePassword.rules.lowercase'), valid: /[a-z]/.test(newPassword.value) },
    { key: 'number', label: t('changePassword.rules.number'), valid: /[0-9]/.test(newPassword.value) },
    { key: 'special', label: t('changePassword.rules.special'), valid: /[@!#$%^&*()_+\-=[\]{}|;':",.<>?/`~\\]/.test(newPassword.value) },
    { key: 'match', label: t('changePassword.rules.match'), valid: newPassword.value.length > 0 && newPassword.value === confirmPassword.value }
  ])
  const rulesValid = computed(() => rules.value.every((r) => r.valid))

  const canSubmit = computed(() => {
    if (mode.value === 'set') return rulesValid.value && loginPassword.value.length > 0
    if (mode.value === 'change') return rulesValid.value && oldPassword.value.length > 0
    return password.value.length > 0
  })

  const title = computed(() =>
    mode.value === 'change'
      ? t('salaryAccess.changeTitle')
      : mode.value === 'set'
        ? t('salaryAccess.setTitle')
        : t('salaryAccess.title')
  )
  const description = computed(() =>
    mode.value === 'change'
      ? t('salaryAccess.changeDescription')
      : mode.value === 'set'
        ? t('salaryAccess.setDescription')
        : t('salaryAccess.description')
  )
  const submitLabel = computed(() =>
    mode.value === 'change'
      ? t('salaryAccess.changeSubmit')
      : mode.value === 'set'
        ? t('salaryAccess.setSubmit')
        : t('salaryAccess.submit')
  )

  const onSubmit = () => {
    if (!canSubmit.value || store.loading) return
    if (mode.value === 'set') {
      store.submit({ new_password: newPassword.value, login_password: loginPassword.value })
    } else if (mode.value === 'change') {
      store.submit({ new_password: newPassword.value, old_password: oldPassword.value })
    } else {
      store.submit({ password: password.value })
    }
  }
</script>

<template>
  <UIModal
    v-model:visible="store.visible"
    :title="title"
    :persistent="true"
    width="440"
    @click:close="store.close()"
  >
    <div class="flex flex-col gap-4 py-1">
      <!-- Icon header -->
      <div class="flex justify-center">
        <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <n-icon size="28" class="text-primary">
            <LockClosed20Regular />
          </n-icon>
        </div>
      </div>

      <p class="text-sm text-textColor2 text-center -mt-1">{{ description }}</p>

      <!-- SET: login parol tasdig'i -->
      <div v-if="mode === 'set'">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('salaryAccess.loginPassword') }}</label>
        <n-input
          v-model:value="loginPassword"
          type="password"
          show-password-on="click"
          :placeholder="$t('salaryAccess.loginPassword')"
          @keydown.enter="onSubmit"
        />
      </div>

      <!-- CHANGE: amaldagi oylik paroli -->
      <div v-if="mode === 'change'">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('salaryAccess.oldPassword') }}</label>
        <n-input
          v-model:value="oldPassword"
          type="password"
          show-password-on="click"
          :placeholder="$t('salaryAccess.oldPassword')"
          @keydown.enter="onSubmit"
        />
      </div>

      <!-- SET / CHANGE: yangi oylik parol + takror + qoidalar -->
      <template v-if="withNewPassword">
        <div>
          <label class="text-xs text-textColor3 mb-1 block">{{ $t('salaryAccess.newPassword') }}</label>
          <n-input
            v-model:value="newPassword"
            type="password"
            show-password-on="click"
            :placeholder="$t('salaryAccess.newPassword')"
          />
        </div>
        <div>
          <label class="text-xs text-textColor3 mb-1 block">{{ $t('salaryAccess.confirmPassword') }}</label>
          <n-input
            v-model:value="confirmPassword"
            type="password"
            show-password-on="click"
            :placeholder="$t('salaryAccess.confirmPassword')"
            @keydown.enter="onSubmit"
          />
        </div>
        <div class="flex flex-col gap-1.5 border border-surface-line rounded-lg px-3 py-2.5">
          <div
            v-for="rule in rules"
            :key="rule.key"
            class="flex items-center gap-2 text-xs transition-colors"
            :class="rule.valid ? 'text-success' : 'text-textColor3'"
          >
            <n-icon size="14" class="shrink-0">
              <Checkmark16Regular v-if="rule.valid" />
              <Dismiss16Regular v-else />
            </n-icon>
            <span>{{ rule.label }}</span>
          </div>
        </div>
      </template>

      <!-- UNLOCK: yagona oylik parol maydoni -->
      <div v-if="mode === 'unlock'">
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('salaryAccess.password') }}</label>
        <n-input
          v-model:value="password"
          type="password"
          show-password-on="click"
          :placeholder="$t('salaryAccess.passwordPlaceholder')"
          autofocus
          @keydown.enter="onSubmit"
        />
      </div>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <n-button type="error" ghost :disabled="store.loading" @click="store.close()">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button type="primary" :loading="store.loading" :disabled="!canSubmit" @click="onSubmit">
          {{ submitLabel }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
