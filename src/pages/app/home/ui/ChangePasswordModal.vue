<script setup>
  import { UIModal } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import {
    Checkmark16Regular,
    Dismiss16Regular,
    LockClosed20Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAccountStore()

  const password     = ref('')
  const confirmPass  = ref('')

  const rules = computed(() => [
    {
      key: 'minLength',
      label: t('changePassword.rules.minLength'),
      valid: password.value.length >= 8
    },
    {
      key: 'uppercase',
      label: t('changePassword.rules.uppercase'),
      valid: /[A-Z]/.test(password.value)
    },
    {
      key: 'lowercase',
      label: t('changePassword.rules.lowercase'),
      valid: /[a-z]/.test(password.value)
    },
    {
      key: 'number',
      label: t('changePassword.rules.number'),
      valid: /[0-9]/.test(password.value)
    },
    {
      key: 'special',
      label: t('changePassword.rules.special'),
      valid: /[@!#$%^&*()_+\-=[\]{}|;':",.<>?/`~\\]/.test(password.value)
    },
    {
      key: 'match',
      label: t('changePassword.rules.match'),
      valid: password.value.length > 0 && password.value === confirmPass.value
    }
  ])

  const allValid = computed(() => rules.value.every(r => r.valid))

  const onSave = () => {
    if (!allValid.value) return
    store._changePassword(password.value)
  }
</script>

<template>
  <UIModal
    v-model:visible="store.changePasswordVisible"
    :title="$t('changePassword.title')"
    :persistent="true"
    width="420"
  >
    <div class="flex flex-col gap-4 py-1">

      <!-- Icon header -->
      <div class="flex justify-center">
        <div class="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center">
          <n-icon size="28" class="text-warning">
            <LockClosed20Regular />
          </n-icon>
        </div>
      </div>

      <p class="text-sm text-textColor2 text-center -mt-1">
        {{ $t('changePassword.description') }}
      </p>

      <!-- New password -->
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('changePassword.newPassword') }}</label>
        <n-input
          v-model:value="password"
          type="password"
          show-password-on="click"
          :placeholder="$t('changePassword.newPasswordPlaceholder')"
        />
      </div>

      <!-- Confirm password -->
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{ $t('changePassword.confirmPassword') }}</label>
        <n-input
          v-model:value="confirmPass"
          type="password"
          show-password-on="click"
          :placeholder="$t('changePassword.confirmPasswordPlaceholder')"
        />
      </div>

      <!-- Validation checklist -->
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

    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <n-button
          type="error"
          ghost
          :disabled="store.changePasswordLoading"
          @click="store.changePasswordVisible = false"
        >
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          type="primary"
          :loading="store.changePasswordLoading"
          :disabled="!allValid"
          @click="onSave"
        >
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
