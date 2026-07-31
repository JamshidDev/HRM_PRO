<script setup>
  import { UIModal } from '@/components/index.js'
  import { useTimesheetDepartmentStore } from '@/store/modules/index.js'
  import { Delete20Filled } from '@vicons/fluent'

  const store = useTimesheetDepartmentStore()

  const onDelete = (v) => {
    const data = {
      department_id: v?.id
    }
    store._delete(data, () => {
      store.previewList = store.previewList.filter((x) => x.id !== v.id)
    })
  }
</script>

<template>
  <UIModal v-model:visible="store.listVisible" :title="$t('content.view')" :width="600">
    <div class="w-full overflow-y-auto h-[600px] border border-surface-line rounded-lg p-2">
      <template v-for="item in store.previewList" :key="item.id">
        <div class="mb-3 flex bg-surface-ground p-1 rounded-lg items-center">
          <div class="w-[calc(100%-40px)] px-2">
            <span class="line-clamp-2 leading-[1.2] font-medium">{{ item?.department?.name }}</span>
            <span class="line-clamp-1 text-secondary text-xs leading-[1.2]">
              {{ item?.organization?.name }}
            </span>
          </div>

          <n-button
            :loading="store.deleteLoading"
            @click="onDelete(item)"
            type="error"
            secondary
            size="small"
          >
            <template #icon>
              <Delete20Filled />
            </template>
          </n-button>
        </div>
      </template>

      <p
        v-if="store.previewList.length === 0"
        class="text-center w-full text-secondary !mt-[100px]"
      >
        {{ $t('content.no-data') }}
      </p>
    </div>
  </UIModal>
</template>
