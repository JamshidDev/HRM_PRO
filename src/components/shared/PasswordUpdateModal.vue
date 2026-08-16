<script setup>
  /**
   * Parol yangilash modali — «Qo'shimchalar → Foydalanuvchilar» va HR «Xodimlar»
   * menyusi AYNAN shu komponentni ishlatadi (talab: ikkala joyda bir xil bo'lsin).
   *
   * Komponent faqat FORMA: qoidalar, generator, tasdiqlash. So'rovni ota
   * komponent yuboradi — `submit` eventida tayyor parol qaytadi.
   */
  import { UIModal } from '@components'
  import {
    ArrowClockwise20Regular,
    Checkmark16Regular,
    Dismiss16Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const visible = defineModel('visible', { type: Boolean, default: false })

  const props = defineProps({
    loading: { type: Boolean, default: false },
    title: { type: String, default: null }
  })

  const emits = defineEmits(['submit'])

  const password = ref('')
  const confirmPass = ref('')

  // Modal har ochilganda toza boshlanadi — oldingi parol qolib ketmasin.
  watch(visible, (v) => {
    if (v) {
      password.value = ''
      confirmPass.value = ''
    }
  })

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

  const allValid = computed(() => rules.value.every((r) => r.valid))

  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const digits = '0123456789'
    const special = '@!#$%^&*'
    const all = upper + lower + digits + special
    const chars = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)]
    ]
    for (let i = 4; i < 8; i++) {
      chars.push(all[Math.floor(Math.random() * all.length)])
    }
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }
    const generated = chars.join('')
    password.value = generated
    confirmPass.value = generated
  }

  const onSubmit = () => {
    if (!allValid.value) return
    emits('submit', password.value)
  }
</script>

<template>
  <UIModal
    :width="420"
    :visible="visible"
    @update:visible="(v) => (visible = v)"
    :title="props.title || $t('workerRole.updatePassword')"
  >
    <div class="flex flex-col gap-3 pb-4">
      <!-- Yangi parol -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="text-xs text-textColor3">{{ $t('passwordForm.newPassword') }}</label>
          <n-button size="tiny" type="primary" text @click="generatePassword">
            <template #icon>
              <n-icon size="14"><ArrowClockwise20Regular /></n-icon>
            </template>
            {{ $t('passwordForm.generatePassword') }}
          </n-button>
        </div>
        <n-input
          v-model:value="password"
          type="password"
          show-password-on="click"
          :placeholder="$t('passwordForm.newPasswordPlaceholder')"
        />
      </div>

      <!-- Tasdiqlash -->
      <div>
        <label class="text-xs text-textColor3 mb-1 block">{{
          $t('passwordForm.confirmPassword')
        }}</label>
        <n-input
          v-model:value="confirmPass"
          type="password"
          show-password-on="click"
          :placeholder="$t('passwordForm.confirmPasswordPlaceholder')"
        />
      </div>

      <!-- Talablar -->
      <div class="border border-surface-line rounded-xl px-4 py-3 bg-surface-ground">
        <p class="text-xs font-semibold text-textColor2 mb-2">
          {{ $t('passwordForm.requirements') }}
        </p>
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
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="props.loading" :disabled="!allValid" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </UIModal>
</template>
