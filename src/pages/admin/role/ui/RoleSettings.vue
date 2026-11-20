<script setup>
  import { computed } from 'vue'
  import { useUserRoleStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import ScopePanel from './ScopePanel.vue'
  import { isRoleKeyInvalid } from '../roleScope.js'

  // 1-qadam: kalit, nom, tur va ko'rinish doirasi — oddiy forma.
  const { t } = i18n.global
  const store = useUserRoleStore()

  const guardOptions = computed(() => [
    { value: 'sanctum', label: t('userRole.form.typeSanctum') },
    { value: 'integration', label: t('userRole.form.typeIntegration') }
  ])
  const guard = computed({
    get: () => store.payload.guard_name,
    set: (v) => {
      if (!store.visibleType || v === store.payload.guard_name) return
      store.payload.guard_name = v
      store.onGuardChange()
    }
  })
  const keyError = computed(() =>
    isRoleKeyInvalid(store.payload.key, store.visibleType) ? t('userRole.form.keyInvalid') : null
  )
</script>

<template>
  <div class="min-h-full flex items-center justify-center py-4">
    <div
      class="w-full max-w-[560px] rounded-xl border border-surface-line bg-surface-section px-5 pt-5 pb-1"
    >
      <div class="grid grid-cols-1">
        <n-form-item
          :label="$t('userRole.form.key')"
          required
          :validation-status="keyError ? 'error' : undefined"
          :feedback="keyError || ''"
        >
          <n-input
            :value="store.payload.key"
            :placeholder="$t('userRole.form.keyPlaceholder')"
            :disabled="!store.visibleType"
            @update:value="(v) => (store.payload.key = (v || '').trim() || null)"
          />
        </n-form-item>
        <n-form-item :label="$t('userRole.form.displayName')" required>
          <n-input
            v-model:value="store.payload.name"
            :placeholder="$t('userRole.form.displayNamePlaceholder')"
          />
        </n-form-item>
        <n-form-item :label="$t('userRole.form.type')">
          <n-select v-model:value="guard" :options="guardOptions" :disabled="!store.visibleType" />
        </n-form-item>
      </div>

      <!-- Doim ko'rinadi (integration — o'chiq), kartochka o'lchami o'zgarmasin. -->
      <ScopePanel :disabled="store.payload.guard_name !== 'sanctum'" />
    </div>
  </div>
</template>
