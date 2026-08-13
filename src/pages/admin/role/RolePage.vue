<script setup>
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { useUserRoleStore, useAccountStore } from '@/store/modules/index.js'
  import createFrom from './ui/createForm.vue'
  import i18n from '@/i18n/index.js'
  const { t } = i18n.global

  const store = useUserRoleStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)

  // Header'dagi Guard/Scope select opsiyalari (forma maydonlari shu yerga ko'chirilgan).
  const guardOptions = computed(() => [
    { label: t('userRole.form.typeSanctum'), value: 'sanctum' },
    { label: t('userRole.form.typeIntegration'), value: 'integration' },
  ])
  const scopeOptions = [
    { label: 'Local', value: 'local' },
    { label: 'Global', value: 'global' },
  ]

  const onSearch = (v) => {
    if (!accStore.checkAction(accStore.pn.rolesRead)) return
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
  })
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      :add-permission="accStore.pn.rolesWrite"
      v-model:search="store.params.search"
      @on-search="onSearch"
      :search-loading="store.loading"
      @on-add="onAdd"
      :show-filter-button="false"
    />
    <Table />
    <UIModal v-model:visible="store.visible" :width="1200" height="85vh" card-class="relative">
      <template #header>
        <!-- Role nomi / Guard / Scope + Qidiruv / Bekor / Saqlash — bitta qatorda -->
        <div class="flex items-center gap-2 px-4 pt-3 pb-1">
          <n-input
            v-model:value="store.payload.name"
            style="width: 220px; flex: none"
            :placeholder="$t('userRole.form.name')"
          />
          <n-select
            v-model:value="store.payload.guard_name"
            :options="guardOptions"
            :disabled="!store.visibleType"
            style="width: 160px; flex: none"
            @update:value="store.onGuardChange"
          />
          <n-select
            v-if="store.payload.guard_name === 'sanctum'"
            v-model:value="store.payload.scope_type"
            :options="scopeOptions"
            style="width: 130px; flex: none"
          />
          <div class="flex-1"></div>
          <n-button @click="store.openVisible(false)" type="error" ghost class="w-[110px]">
            {{ $t('content.cancel') }}
          </n-button>
          <n-button
            @click="createFormRef?.submit()"
            :loading="store.saveLoading"
            :disabled="!store.payload.name"
            type="primary"
            class="w-[110px]"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
      <template #default>
        <createFrom ref="createFormRef" />
      </template>
    </UIModal>
  </UIPageContent>
</template>
