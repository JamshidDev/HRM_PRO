<script setup>
  import { useAccountStore } from '@/store/modules/app/accountStore.js'
  import { resetBotHandle, resetBotUrl } from '@/utils/index.js'
  import { Checkmark16Regular, Dismiss16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useAccountStore()

  /* Muddat hisobi `accountStore` da — bosh sahifadagi ogohlantirish
     (`home/ui/PasswordExpiryAlert.vue`) ham aynan shu getter'lardan foydalanadi.
     Sana noma'lum bo'lsa blok baribir ko'rsatiladi: «har 30 kunda» qoidasining
     o'zi foydalanuvchiga kerak, faqat hisob qismi tushib qoladi. */
  const daysLeft = computed(() => store.passwordDaysLeft)

  /* Ogohlantirish darajasi:
   *   error   — muddat o'tgan (yoki backend `must_change` bergan);
   *   warning — bir haftadan kam qoldi;
   *   info    — hali vaqt bor, ya'ni bu shunchaki eslatma. */
  const noticeType = computed(() => {
    if (store.passwordExpired) return 'error'
    if (daysLeft.value != null && daysLeft.value <= 7) return 'warning'
    return 'info'
  })

  const noticeText = computed(() => {
    if (store.passwordExpired) return t('passwordForm.expired')
    if (daysLeft.value == null) return null
    if (daysLeft.value === 1) return t('passwordForm.expiresTomorrow')
    return t('passwordForm.daysLeft', { days: daysLeft.value })
  })

  // API sana emas, KUN SONI beradi (`password_changed_days`) — shuning uchun
  // «12.05.2026 da yangilangan» emas, «N kun oldin yangilangan».
  const lastChangedText = computed(() =>
    store.passwordAgeDays == null
      ? null
      : t('passwordForm.lastChanged', { days: store.passwordAgeDays })
  )

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
      key: 'number',
      label: t('passwordForm.rules.number'),
      valid: /[0-9]/.test(password.value)
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
  <!-- Bitta ildiz: ogohlantirish forma bilan bir komponentda turadi, ota
       elementdagi klasslar (fallthrough) bo'linib ketmasin. -->
  <div>
    <!-- Parol siyosati eslatmasi: qoida (har 30 kunda) + muddatgacha qolgan kun. -->
    <n-alert :type="noticeType" :title="$t('passwordForm.policyTitle')" class="mb-5">
      <p>{{ $t('passwordForm.policyDesc') }}</p>
      <p v-if="noticeText" class="mt-1 font-semibold">{{ noticeText }}</p>
      <!-- Muddat o'tgach quyidagi forma ish bermaydi — parol faqat Telegram
           bot orqali tiklanadi, shuning uchun havola shu yerda beriladi. -->
      <template v-if="store.passwordExpired">
        <p class="mt-1">{{ $t('passwordForm.expiredResetHint', { bot: resetBotHandle }) }}</p>
        <a
          :href="resetBotUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-1 inline-block font-semibold underline"
        >
          {{ $t('passwordForm.resetViaBot') }}
        </a>
      </template>
      <p v-if="lastChangedText" class="mt-1 text-xs opacity-80">{{ lastChangedText }}</p>
    </n-alert>

    <div class="profile-input-gray grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Validation checklist -->
      <div>
        <p class="text-sm font-semibold text-textColor0 mb-3">{{ $t('passwordForm.requirements') }}</p>
        <div class="flex flex-col gap-2">
          <div
            v-for="rule in rules"
            :key="rule.key"
            class="flex items-center gap-2 text-sm transition-colors duration-200"
            :class="rule.valid ? 'text-success' : 'text-textColor3'"
          >
            <n-icon size="16" class="shrink-0">
              <Checkmark16Regular v-if="rule.valid" />
              <Dismiss16Regular v-else />
            </n-icon>
            <span>{{ rule.label }}</span>
          </div>
        </div>
      </div>

      <!-- Fields -->
      <div class="flex flex-col gap-3">
        <div>
          <label class="text-sm text-textColor0 mb-1 block">{{ $t('passwordForm.newPassword') }}</label>
          <n-input
            size="large"
            v-model:value="password"
            type="password"
            show-password-on="click"
            :placeholder="$t('passwordForm.newPasswordPlaceholder')"
          />
        </div>

        <div>
          <label class="text-sm text-textColor0 mb-1 block">{{ $t('passwordForm.confirmPassword') }}</label>
          <n-input
            size="large"
            v-model:value="confirmPass"
            type="password"
            show-password-on="click"
            :placeholder="$t('passwordForm.confirmPasswordPlaceholder')"
          />
        </div>

        <!-- Save button -->
        <div class="flex justify-end">
          <n-button
            size="large"
            type="primary"
            :loading="store.changePasswordLoading"
            :disabled="!allValid"
            @click="onSave"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .profile-input-gray :deep(.n-input) {
    --n-color: var(--surface-ground) !important;
    --n-color-focus: var(--surface-ground) !important;
  }
</style>
