<script setup>
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { useUserRoleStore, useAccountStore } from '@/store/modules/index.js'
  import createFrom from './ui/createForm.vue'
  import EimzoGateCard from './ui/EimzoGateCard.vue'
  import { useEimzoGate } from './ui/useEimzoGate.js'
  import RoleSettings from './ui/RoleSettings.vue'
  import { isRoleSettingsValid } from './roleScope.js'
  import i18n from '@/i18n/index.js'
  import {
    ArrowLeft20Regular,
    ArrowRight20Regular,
    Checkmark16Filled,
    Dismiss20Regular,
    Save20Regular,
    Search24Regular,
    Settings20Regular,
    ShieldKeyhole20Regular
  } from '@vicons/fluent'
  const { t } = i18n.global

  const store = useUserRoleStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)
  const eimzoGate = useEimzoGate()

  // Forma ikki qadam: 1) rol sozlamalari, 2) ruxsatlar.
  const settingsValid = computed(() =>
    isRoleSettingsValid(store.payload, store.visibleType, store.pendingLevel)
  )
  const steps = [
    { id: 'settings', icon: Settings20Regular, label: 'userRole.form.stepSettings' },
    { id: 'permissions', icon: ShieldKeyhole20Regular, label: 'userRole.form.stepPermissions' }
  ]
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

  // Filtr: rol turi, kesim, doira (API scope_type), ruxsat.
  const guardOptions = computed(() => [
    { id: 'sanctum', name: t('userRole.form.typeSanctum') },
    { id: 'integration', name: t('userRole.form.typeIntegration') }
  ])
  const levelOptions = computed(() =>
    ['organization', 'department'].map((id) => ({ id, name: t(`userRole.form.level_${id}`) }))
  )
  const scopeOptions = computed(() =>
    [
      ['local', 'single'],
      ['global', 'subtree'],
      ['all', 'all']
    ].map(([id, k]) => ({ id, name: t(`userRole.form.scope_${k}`) }))
  )
  const filterKeys = ['guard', 'scope_level', 'scope_type', 'permission_id']
  const filterCount = computed(() => filterKeys.filter((k) => store.params[k] != null).length)
  const onFilter = () => {
    store.params.page = 1
    store._index()
  }
  const resetFilter = () => {
    filterKeys.forEach((k) => (store.params[k] = null))
    onFilter()
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
      :filter-count="filterCount"
      @onClear="resetFilter"
    >
      <template #filterContent>
        <div class="ui-filter-grid grid grid-cols-12 gap-x-5 gap-y-4">
          <div class="col-span-12 md:col-span-6">
            <label>{{ $t('userRole.form.type') }}</label>
            <n-select
              v-model:value="store.params.guard"
              clearable
              :options="guardOptions"
              label-field="name"
              value-field="id"
              @update:value="onFilter"
            />
          </div>
          <div class="col-span-12 md:col-span-6">
            <label>{{ $t('userRole.form.scopeLevel') }}</label>
            <n-select
              v-model:value="store.params.scope_level"
              clearable
              :options="levelOptions"
              label-field="name"
              value-field="id"
              @update:value="onFilter"
            />
          </div>
          <div class="col-span-12 md:col-span-6">
            <label>{{ $t('userRole.form.scopeKind') }}</label>
            <n-select
              v-model:value="store.params.scope_type"
              clearable
              :options="scopeOptions"
              label-field="name"
              value-field="id"
              @update:value="onFilter"
            />
          </div>
          <div class="col-span-12 md:col-span-6">
            <label>{{ $t('userRole.form.permissions') }}</label>
            <n-select
              v-model:value="store.params.permission_id"
              filterable
              clearable
              :options="store.originAllPermissionList"
              label-field="name"
              value-field="id"
              @update:value="onFilter"
            />
          </div>
        </div>
      </template>
    </UIPageFilter>
    <!-- E-IMZO ustuni ruxsat aniqlangach qo'shiladi — jadval ustunlarini qayta hisoblasin. -->
    <Table :key="eimzoGate.available.value ? 'with-eimzo' : 'plain'" />
    <UIModal
      v-model:visible="store.visible"
      :width="1200"
      height="85vh"
      card-class="relative"
      :title="store.visibleType ? $t('userRole.createTitle') : $t('userRole.updateTitle')"
    >
      <template #header-title>
        {{ store.visibleType ? $t('userRole.createTitle') : $t('userRole.updateTitle') }}
        <!-- Qadamlar header markazida (card relative): ikonka + chiziq. -->
        <div class="role-steps absolute left-1/2 -translate-x-1/2 top-[8px] z-10">
          <template v-for="(s, i) in steps" :key="s.id">
            <span v-if="i > 0" class="role-steps__line" :class="{ done: !onSettingsStep }"></span>
            <button
              type="button"
              class="role-steps__item"
              :class="{
                active: step === s.id,
                done: s.id === 'settings' && !onSettingsStep,
                disabled: s.id === 'permissions' && !settingsValid
              }"
              @click="step = s.id"
            >
              <span class="role-steps__icon">
                <n-icon size="16">
                  <Checkmark16Filled v-if="s.id === 'settings' && !onSettingsStep" />
                  <component :is="s.icon" v-else />
                </n-icon>
              </span>
              <span class="role-steps__label">{{ $t(s.label) }}</span>
            </button>
          </template>
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
            <template #icon><n-icon :component="Dismiss20Regular" /></template>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button v-if="!onSettingsStep" class="w-[130px]" @click="step = 'settings'">
            <template #icon><n-icon :component="ArrowLeft20Regular" /></template>
            {{ $t('userRole.form.back') }}
          </n-button>
          <n-button
            v-if="onSettingsStep"
            :type="store.visibleType ? 'primary' : 'default'"
            :disabled="!settingsValid"
            class="w-[130px]"
            icon-placement="right"
            @click="step = 'permissions'"
          >
            <template #icon><n-icon :component="ArrowRight20Regular" /></template>
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
            <template #icon><n-icon :component="Save20Regular" /></template>
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>

<style scoped>
  .role-steps {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  }
  .role-steps__item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--textColor3);
    font-size: 14px;
    cursor: pointer;
  }
  .role-steps__item.disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  .role-steps__icon {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid var(--surface-line);
    background: var(--surface-section);
    transition: all 0.15s;
  }
  .role-steps__item.active {
    color: var(--textColor0);
    font-weight: 600;
  }
  .role-steps__item.active .role-steps__icon {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: #fff;
  }
  .role-steps__item.done .role-steps__icon {
    background: var(--success-color, #12b76a);
    border-color: var(--success-color, #12b76a);
    color: #fff;
  }
  .role-steps__line {
    width: 64px;
    height: 2px;
    border-radius: 2px;
    background: var(--surface-line);
  }
  .role-steps__line.done {
    background: var(--success-color, #12b76a);
  }
</style>
