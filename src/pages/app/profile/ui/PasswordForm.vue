<script setup>
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { Checkmark16Regular, Dismiss16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAccountStore()

  const password    = ref('')
  const confirmPass = ref('')

  const rules = computed(() => [
    {
      key: 'minLength',
      label: t('passwordForm.rules.minLength'),
      valid: password.value.length >= 8
    },
    {
      key: 'uppercase',
      label: t('passwordForm.rules.uppercase'),
      valid: /[A-Z]/.test(password.value)
    },
    {
      key: 'lowercase',
      label: t('passwordForm.rules.lowercase'),
      valid: /[a-z]/.test(password.value)
    },
    {
      key: 'special',
      label: t('passwordForm.rules.special'),
      valid: /[@!#$%^&*()_+\-=[\]{}|;':",.<>?/`~\\]/.test(password.value)
    },
    {
      key: 'match',
      label: t('passwordForm.rules.match'),
      valid: password.value.length > 0 && password.value === confirmPass.value
    }
  ])

  const allValid = computed(() => rules.value.every(r => r.valid))

  const onSave = () => {
    if (!allValid.value) return
    store._changePassword(password.value).then(() => {
      password.value = ''
      confirmPass.value = ''
    })
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- New password -->
    <div>
      <label class="text-xs text-textColor3 mb-1 block">{{ $t('passwordForm.newPassword') }}</label>
      <n-input
        v-model:value="password"
        type="password"
        show-password-on="click"
        :placeholder="$t('passwordForm.newPasswordPlaceholder')"
      />
    </div>

    <!-- Confirm password -->
    <div>
      <label class="text-xs text-textColor3 mb-1 block">{{ $t('passwordForm.confirmPassword') }}</label>
      <n-input
        v-model:value="confirmPass"
        type="password"
        show-password-on="click"
        :placeholder="$t('passwordForm.confirmPasswordPlaceholder')"
      />
    </div>

    <!-- Validation checklist -->
    <div class="border border-surface-line rounded-xl px-4 py-3 bg-surface-ground">
      <p class="text-xs font-semibold text-textColor2 mb-2">{{ $t('passwordForm.requirements') }}</p>
      <div class="flex flex-col gap-2">
        <div
          v-for="rule in rules"
          :key="rule.key"
          class="flex items-center gap-2 text-xs transition-colors duration-200"
          :class="rule.valid ? 'text-success' : 'text-textColor3'"
        >
          <n-icon size="14" class="shrink-0">
            <Checkmark16Regular v-if="rule.valid" />
            <Dismiss16Regular v-else />
          </n-icon>
          <span>{{ rule.label }}</span>
        </div>
      </div>
    </div>

    <!-- Save button -->
    <div class="flex justify-end">
      <n-button
        type="primary"
        :loading="store.changePasswordLoading"
        :disabled="!allValid"
        @click="onSave"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>
  </div>
</template>
