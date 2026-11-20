<script setup>
  import { computed } from 'vue'
  import { UISegmentTabs } from '@/components/index.js'
  import { useUserRoleStore } from '@/store/modules/index.js'
  import i18n from '@/i18n/index.js'
  import ScopePanel from './ScopePanel.vue'
  import { isRoleKeyInvalid } from '../roleScope.js'

  // 1-qadam: asosiy ma'lumotlar (kalit, nom, tur) va ko'rinish doirasi.
  const { t } = i18n.global
  const store = useUserRoleStore()

  const guardTabs = computed(() => [
    { id: 'sanctum', name: t('userRole.form.typeSanctum'), disabled: !store.visibleType },
    { id: 'integration', name: t('userRole.form.typeIntegration'), disabled: !store.visibleType }
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
  const keyHelp = computed(() =>
    store.visibleType ? t('userRole.form.keyHint') : t('userRole.form.keyLocked')
  )
</script>

<template>
  <div class="role-settings">
    <section class="rs-section">
      <header class="rs-head">
        <h3>{{ $t('userRole.form.sectionMain') }}</h3>
        <p>{{ $t('userRole.form.sectionMainDesc') }}</p>
      </header>
      <div class="rs-grid">
        <label class="rs-field">
          <span class="rs-label">{{ $t('userRole.form.key') }} <b class="rs-req">*</b></span>
          <n-input
            :value="store.payload.key"
            class="rs-key"
            :placeholder="$t('userRole.form.keyPlaceholder')"
            :disabled="!store.visibleType"
            :status="keyError ? 'error' : undefined"
            @update:value="(v) => (store.payload.key = (v || '').trim() || null)"
          />
          <small :class="keyError ? 'rs-error' : 'rs-help'">{{ keyError || keyHelp }}</small>
        </label>
        <label class="rs-field">
          <span class="rs-label">{{ $t('userRole.form.displayName') }} <b class="rs-req">*</b></span>
          <n-input
            v-model:value="store.payload.name"
            :placeholder="$t('userRole.form.displayNamePlaceholder')"
          />
          <small class="rs-help">{{ $t('userRole.form.displayNameHint') }}</small>
        </label>
      </div>
      <div class="rs-field">
        <span class="rs-label">{{ $t('userRole.form.type') }}</span>
        <UISegmentTabs v-model="guard" :tabs="guardTabs" size="sm" variant="elevated" />
      </div>
    </section>

    <section v-if="store.payload.guard_name === 'sanctum'" class="rs-section">
      <header class="rs-head">
        <h3>{{ $t('userRole.form.sectionScope') }}</h3>
        <p>{{ $t('userRole.form.sectionScopeDesc') }}</p>
      </header>
      <ScopePanel />
    </section>
  </div>
</template>

<style scoped>
  .role-settings {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 920px;
    margin: 0 auto;
    padding: 8px 0 24px;
  }
  .rs-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px 20px 20px;
    border: 1px solid var(--surface-line);
    border-radius: 14px;
    background: var(--surface-section);
  }
  .rs-head h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--textColor0);
  }
  .rs-head p {
    margin: 2px 0 0;
    font-size: 13px;
    color: var(--textColor3);
  }
  .rs-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .rs-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .rs-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--textColor1);
  }
  .rs-req {
    color: var(--error-color, #d92d20);
    font-weight: 600;
  }
  .rs-key :deep(input) {
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  }
  .rs-help {
    font-size: 12px;
    color: var(--textColor3);
  }
  .rs-error {
    font-size: 12px;
    color: var(--error-color, #d92d20);
  }
  @media (max-width: 760px) {
    .rs-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
