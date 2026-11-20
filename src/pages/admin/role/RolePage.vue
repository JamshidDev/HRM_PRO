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
  import { Search24Regular } from '@vicons/fluent'
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
    {
      id: 'permissions',
      name: `2. ${t('userRole.form.stepPermissions')}`,
      disabled: !settingsValid.value
    }
  ])
  const step = computed({
    get: () => store.formTab,
    set: (v) => {
      if (v === 'permissions' && !settingsValid.value) return
      store.formTab = v
    }
  })
  const onSettingsStep = computed(() => store.formTab === 'settings')

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
    <UIModal
      v-model:visible="store.visible"
      :width="1200"
      :height="onSettingsStep ? null : '85vh'"
      card-class="relative"
      :title="store.visibleType ? $t('userRole.createTitle') : $t('userRole.updateTitle')"
    >
      <template #header-title>
        {{ store.visibleType ? $t('userRole.createTitle') : $t('userRole.updateTitle') }}
        <!-- Qadamlar header markazida (card relative). -->
        <div class="absolute left-1/2 -translate-x-1/2 top-[6px] z-10 font-normal">
          <UISegmentTabs v-model="step" :tabs="stepTabs" />
        </div>
      </template>
      <template #default>
        <RoleSettings v-if="onSettingsStep" />
        <!-- Ruxsatlar formasi saqlab turiladi (v-show) — qadamlar orasida tanlov yo'qolmaydi. -->
        <div v-show="!onSettingsStep">
          <createFrom ref="createFormRef" />
        </div>
      </template>
      <template #footer>
        <div class="flex items-center gap-2 px-4 py-2 border-t border-surface-line">
          <n-input
            v-if="!onSettingsStep"
            v-model:value="store.query"
            clearable
            style="width: 320px; max-width: 40%"
            :placeholder="$t('content.search')"
          >
            <template #prefix>
              <n-icon :component="Search24Regular" />
            </template>
          </n-input>
          <div class="flex-1"></div>
          <n-button type="error" ghost class="w-[130px]" @click="store.openVisible(false)">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button v-if="!onSettingsStep" class="w-[130px]" @click="step = 'settings'">
            {{ $t('userRole.form.back') }}
          </n-button>
          <n-button
            v-if="onSettingsStep"
            :type="store.visibleType ? 'primary' : 'default'"
            :disabled="!settingsValid"
            class="w-[130px]"
            @click="step = 'permissions'"
          >
            {{ $t('userRole.form.next') }}
          </n-button>
          <n-button
            v-if="showSave"
            type="primary"
            class="w-[130px]"
            :loading="store.saveLoading"
            :disabled="!settingsValid"
            @click="onSave"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>
