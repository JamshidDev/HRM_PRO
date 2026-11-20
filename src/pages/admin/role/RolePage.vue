<script setup>
  import { UIModal, UIPageContent, UIPageFilter, UISegmentTabs } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { useUserRoleStore, useAccountStore } from '@/store/modules/index.js'
  import createFrom from './ui/createForm.vue'
  import EimzoGateCard from './ui/EimzoGateCard.vue'
  import { useEimzoGate } from './ui/useEimzoGate.js'
  import RoleSettings from './ui/RoleSettings.vue'
  import { isRoleSettingsValid } from './roleScope.js'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global

  const store = useUserRoleStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)
  const eimzoGate = useEimzoGate()

  // Forma ikki qadam: 1) rol sozlamalari, 2) ruxsatlar.
  const settingsValid = computed(() =>
    isRoleSettingsValid(store.payload, store.visibleType, store.pendingLevel)
  )
  const stepTabs = computed(() => [
    { id: 'settings', name: `1. ${t('userRole.form.stepSettings')}` },
    { id: 'permissions', name: `2. ${t('userRole.form.stepPermissions')}`, disabled: !settingsValid.value }
  ])
  const step = computed({
    get: () => store.formTab,
    set: (v) => {
      if (v === 'permissions' && !settingsValid.value) return
      store.formTab = v
    }
  })
  const onSettingsStep = computed(() => store.formTab === 'settings')

  // Qisqa xulosa — 2-qadam tepasida.
  const summary = computed(() => {
    const p = store.payload
    const parts = [p.key, p.name].filter(Boolean)
    if (p.guard_name === 'integration') parts.push(t('userRole.form.typeIntegration'))
    else if (p.scope_level)
      parts.push(t(`userRole.form.level_${p.scope_level}`), t(`userRole.form.scope_${p.scope_type}`))
    return parts
  })

  // Yangi rol faqat 2-qadamda saqlanadi; tahrirda istalgan qadamdan saqlash mumkin.
  const showSave = computed(() => !onSettingsStep.value || !store.visibleType)
  const onSave = () => {
    if (!settingsValid.value) return
    if (createFormRef.value) createFormRef.value.submit()
    else if (store.visibleType) store._create()
    else store._update()
  }

  const onSearch = () => {
    store.params.page = 1
    store._index()
  }

  const onAdd = () => {
    if (!accStore.checkAction(accStore.pn.rolesWrite)) return
    store.resetForm()
    // resetForm guard'ni 'sanctum'ga qaytaradi — mos permission ro'yxatini qayta yuklaymiz
    // (avvalgi integration tahriridan qolgan bo'lishi mumkin).
    store._getAllPermission()
    store.visibleType = true
    store.visible = true
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.rolesRead)) return
    store._index()
    store._getAllPermission()
    eimzoGate.load()
  })
</script>

<template>
  <UIPageContent>
    <EimzoGateCard />
    <UIPageFilter
      :add-permission="accStore.pn.rolesWrite"
      v-model:search="store.params.search"
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
    />
    <!-- E-IMZO ustuni ruxsat aniqlangach qo'shiladi — jadval ustunlarini qayta hisoblasin. -->
    <Table :key="eimzoGate.available.value ? 'with-eimzo' : 'plain'" />
    <UIModal v-model:visible="store.visible" :width="1200" height="85vh" card-class="relative">
      <template #header>
        <!-- Sarlavha + qadamlar + tugmalar -->
        <div class="flex items-center gap-3 px-4 pt-3 pb-3 flex-wrap">
          <span class="role-title">
            {{ store.visibleType ? $t('userRole.createTitle') : $t('userRole.updateTitle') }}
          </span>
          <UISegmentTabs v-model="step" :tabs="stepTabs" size="sm" />
          <div class="flex-1"></div>
          <n-button @click="store.openVisible(false)" type="error" ghost class="w-[110px]">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button v-if="!onSettingsStep" class="w-[110px]" @click="step = 'settings'">
            {{ $t('userRole.form.back') }}
          </n-button>
          <n-button
            v-if="onSettingsStep"
            :type="store.visibleType ? 'primary' : 'default'"
            :disabled="!settingsValid"
            class="w-[110px]"
            @click="step = 'permissions'"
          >
            {{ $t('userRole.form.next') }}
          </n-button>
          <n-button
            v-if="showSave"
            @click="onSave"
            :loading="store.saveLoading"
            :disabled="!settingsValid"
            type="primary"
            class="w-[110px]"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
        <div v-if="!onSettingsStep" class="role-summary">
          <span v-for="(s, i) in summary" :key="i" class="role-chip" :class="{ mono: i === 0 }">{{ s }}</span>
          <n-button text type="primary" size="small" @click="step = 'settings'">
            {{ $t('userRole.form.summaryEdit') }}
          </n-button>
        </div>
      </template>
      <template #default>
        <RoleSettings v-if="onSettingsStep" />
        <!-- Ruxsatlar formasi saqlab turiladi (v-show) — qadamlar orasida tanlov yo'qolmaydi. -->
        <div v-show="!onSettingsStep">
          <createFrom ref="createFormRef" />
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>

<style scoped>
  .role-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--textColor0);
  }
  .role-summary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 16px;
    border-top: 1px solid var(--surface-line);
    background: var(--surface-ground-soft);
  }
  .role-chip {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--fig-chip-brand-bg);
    color: var(--fig-chip-brand-text);
  }
  .role-chip.mono {
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  }
</style>
