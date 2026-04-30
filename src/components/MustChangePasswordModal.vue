<script setup>
  import { useAccountStore } from '@/store/modules/index.js'
  import PasswordForm from '@/pages/app/profile/ui/PasswordForm.vue'

  const store = useAccountStore()
</script>

<template>
  <n-modal
    :show="store.mustChangePassword"
    :mask-closable="false"
    :close-on-esc="false"
    :auto-focus="false"
    :trap-focus="false"
  >
    <div class="w-full max-w-[480px] mx-4 bg-surface-section rounded-2xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="px-6 pt-5 pb-4 border-b border-surface-line">
        <h2 class="text-base font-semibold text-textColor0">
          {{ $t('passwordForm.mustChangeTitle') }}
        </h2>
        <p class="text-xs text-textColor3 mt-0.5">
          {{ $t('passwordForm.mustChangeDesc') }}
        </p>
      </div>
      <!-- Form -->
      <div class="px-6 py-5">
        <div class="border border-surface-line rounded-xl p-5">
          <PasswordForm />
        </div>
      </div>
    </div>
  </n-modal>
</template>
