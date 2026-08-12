<script setup>
  import { ref, computed, watch, onUnmounted } from 'vue'
  import { UIModal } from '@/components/index.js'
  import { useSalaryAccessStore } from '@/store/modules/accountant/salaryAccessStore.js'
  import { LockClosed20Regular, Send20Regular } from '@vicons/fluent'

  const store = useSalaryAccessStore()

  const code = ref('')

  // Bot havolasi: avval backend status.bot_url (TELEGRAM_BOT_USERNAME env), bo'lmasa
  // "parolni unutdingizmi" oqimidagi (ResetForm) HRM bot havolasiga tushamiz.
  const HRM_BOT_LINK =
    import.meta.env.MODE === 'production'
      ? 'https://t.me/hrmpro_robot'
      : 'https://t.me/developer_jr_bot'
  const botLink = computed(() => store.botUrl || HRM_BOT_LINK)

  // Modal ochilganda maydonni tozalaymiz + orqa fonni blur qilamiz (maxfiy oylik
  // ma'lumoti modal ortidan o'qilmasin). body klassi n-modal maskasiga backdrop-filter
  // beradi (pastdagi global style). Modal body'ga teleport bo'lgani uchun modal kartasi blur bo'lmaydi.
  watch(
    () => store.visible,
    (v) => {
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('salary-stepup-open', v)
      }
      if (v) code.value = ''
    }
  )

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('salary-stepup-open')
    }
  })

  const codeExpired = computed(() => store.otpSent && store.otpExpiresIn <= 0)
  const canSubmit = computed(
    () => store.otpSent && !codeExpired.value && code.value.trim().length >= 4
  )
  const canResend = computed(() => !store.loading && store.resendIn <= 0)

  const onSubmit = () => {
    if (!canSubmit.value || store.loading) return
    store.verify(code.value.trim())
  }
  const onResend = () => {
    if (!canResend.value) return
    code.value = ''
    store.requestCode()
  }
</script>

<template>
  <UIModal
    v-model:visible="store.visible"
    :title="$t('salaryAccess.title')"
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

      <!-- Telegram ulanmagan (fail-closed) -->
      <template v-if="store.telegramMissing">
        <p class="text-sm font-medium text-center">{{ $t('salaryAccess.notLinked') }}</p>
        <p class="text-sm text-textColor2 text-center -mt-1">
          {{ $t('salaryAccess.notLinkedHelp') }}
        </p>
        <a
          v-if="botLink"
          :href="botLink"
          target="_blank"
          rel="noopener noreferrer"
          class="block"
        >
          <n-button type="primary" block>
            <template #icon><n-icon><Send20Regular /></n-icon></template>
            {{ $t('salaryAccess.openBot') }}
          </n-button>
        </a>
      </template>

      <!-- Kod yuborilmoqda (hali javob kelmagan) -->
      <div
        v-else-if="!store.otpSent"
        class="flex flex-col items-center gap-2 py-5 text-textColor3 text-sm"
      >
        <n-spin size="small" />
        <span>{{ $t('salaryAccess.sending') }}</span>
      </div>

      <!-- OTP kiritish -->
      <template v-else>
        <p class="text-sm text-textColor2 text-center -mt-1">{{ $t('salaryAccess.sent') }}</p>

        <div>
          <label class="text-xs text-textColor3 mb-1 block">{{ $t('salaryAccess.codeLabel') }}</label>
          <n-input
            v-model:value="code"
            :placeholder="$t('salaryAccess.codePlaceholder')"
            :maxlength="8"
            :allow-input="(v) => /^\d*$/.test(v)"
            autofocus
            @keydown.enter="onSubmit"
          />
          <div class="flex items-center justify-between mt-2 text-xs">
            <span class="text-textColor3">
              <template v-if="codeExpired">{{ $t('salaryAccess.expired') }}</template>
              <template v-else-if="store.otpExpiresIn > 0">
                {{ $t('salaryAccess.expiresIn', { sec: store.otpExpiresIn }) }}
              </template>
            </span>
            <n-button
              text
              type="primary"
              size="tiny"
              :disabled="!canResend"
              @click="onResend"
            >
              <template #icon><n-icon><Send20Regular /></n-icon></template>
              <template v-if="store.resendIn > 0">
                {{ $t('salaryAccess.resendIn', { sec: store.resendIn }) }}
              </template>
              <template v-else>{{ $t('salaryAccess.resend') }}</template>
            </n-button>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-3 pt-2">
        <n-button type="error" ghost :disabled="store.loading" @click="store.close()">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          v-if="!store.telegramMissing"
          type="primary"
          :loading="store.loading"
          :disabled="!canSubmit"
          @click="onSubmit"
        >
          {{ $t('salaryAccess.verify') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>

<!-- Global (scoped EMAS): step-up modal ochiq bo'lganda orqa fonni blur qiladi —
     maxfiy oylik ma'lumoti modal ortidan o'qilmasin. Modal body'ga teleport bo'lgani
     uchun uning o'zi (mask ustida) blur bo'lmaydi. -->
<style>
body.salary-stepup-open .n-modal-mask {
  background-color: rgba(15, 23, 42, 0.55) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}
</style>
