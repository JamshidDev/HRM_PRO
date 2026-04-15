<script setup>
  import { useVacancyApproveStore } from '@/store/modules/index.js'
  import { useComponentStore } from '@/store/modules/index.js'
  import { UIPageContent, UIModal, UISelect } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { Add16Filled } from '@vicons/fluent'

  const store = useVacancyApproveStore()
  const componentStore = useComponentStore()

  onMounted(() => {
    store.params.page = 1
    store._index()
    componentStore._structures()
  })

  const onAdd = () => {
    store.resetForm()
    store.modalVisible = true
  }

  const canSave = computed(
    () => store.selectedFrom.length > 0 && store.selectedTo.length > 0
  )
</script>

<template>
  <UIPageContent>
    <div class="flex justify-end mb-3 shrink-0">
      <n-button type="primary" @click="onAdd">
        <template #icon>
          <n-icon><Add16Filled /></n-icon>
        </template>
        {{ $t('content.add') }}
      </n-button>
    </div>

    <Table />

    <UIModal
      v-model:visible="store.modalVisible"
      :width="600"
      :title="$t('vacancyApprovePage.title')"
    >
      <div class="flex flex-col gap-4 py-2">
        <div>
          <label class="text-xs text-textColor3 font-medium mb-1 block">
            {{ $t('vacancyApprovePage.from') }}
          </label>
          <UISelect
            :multiple="false"
            :options="componentStore.structureList"
            :model-v="store.selectedFrom"
            :checked-val="store.structureCheckFrom"
            @updateModel="(v) => (store.selectedFrom = v)"
            @defaultValue="(v) => (store.selectedFrom = v)"
            @updateCheck="(v) => (store.structureCheckFrom = v)"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
          />
        </div>
        <div>
          <label class="text-xs text-textColor3 font-medium mb-1 block">
            {{ $t('vacancyApprovePage.to') }}
          </label>
          <UISelect
            :multiple="true"
            :options="componentStore.structureList"
            :model-v="store.selectedTo"
            :checked-val="store.structureCheckTo"
            @updateModel="(v) => (store.selectedTo = v)"
            @defaultValue="(v) => (store.selectedTo = v)"
            @updateCheck="(v) => (store.structureCheckTo = v)"
            :loading="componentStore.structureLoading"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 py-2">
          <n-button @click="store.modalVisible = false">{{ $t('content.cancel') }}</n-button>
          <n-button
            type="primary"
            :loading="store.saveLoading"
            :disabled="!canSave"
            @click="store._attach()"
          >
            {{ $t('content.save') }}
          </n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>
