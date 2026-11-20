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
    Checkmark16Filled,
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
