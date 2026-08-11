<script setup>
  import { UIModal, UIPageContent, UIPageFilter } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { useUserRoleStore, useAccountStore } from '@/store/modules/index.js'
  import createFrom from './ui/createForm.vue'
  import i18n from '@/i18n/index.js'
  import { ArrowLeft20Filled } from '@vicons/fluent'
  const { t } = i18n.global

  const store = useUserRoleStore()
  const accStore = useAccountStore()
  const createFormRef = ref(null)

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
    <UIModal v-model:visible="store.visible" :width="1200" height="85vh">
      <template #header>
        <div class="flex flex-col gap-2 px-4 pt-3">
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="w-fit shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-ground hover:bg-surface-line text-sm text-textColor1 transition-colors"
              @click="store.openVisible(false)"
            >
              <n-icon :component="ArrowLeft20Filled" />
              {{ $t('content.back') }}
            </button>
            <div class="flex items-center gap-2 shrink-0">
              <n-input
                v-model:value="store.query"
                clearable
                style="width: 200px; flex: none"
                :placeholder="$t('content.search')"
              />
              <n-button
                @click="store.openVisible(false)"
                type="error"
                ghost
                class="w-[130px]"
              >
                {{ $t('content.cancel') }}
              </n-button>
              <n-button
                @click="createFormRef?.submit()"
                :loading="store.saveLoading"
                type="primary"
                class="w-[130px]"
              >
                {{ $t('content.save') }}
              </n-button>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-textColor0 truncate">
            {{ store.visibleType ? t('userRole.createTitle') : t('userRole.updateTitle') }}
            <span v-if="!store.visibleType && store.payload.name"> — {{ store.payload.name }}</span>
          </h3>
        </div>
      </template>
      <template #default>
        <createFrom ref="createFormRef" />
      </template>
    </UIModal>
  </UIPageContent>
</template>
