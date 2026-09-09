<script setup>
  import { SuperSelect, UIModal } from '@/components/index.js'
  import { useTimesheetDepartmentStore } from '@/store/modules/index.js'
  import { Delete20Filled } from '@vicons/fluent'
  import { useDialog } from 'naive-ui'
  import i18n from '@/i18n/index.js'

  const store = useTimesheetDepartmentStore()
  const dialog = useDialog()
  const { t } = i18n.global

  // Bitta bo'limni tabelchidan uzish (pivot qator id'si bo'yicha, soft-delete).
  const onDelete = (v) => {
    dialog.warning({
      title: t('content.delete'),
      content: t('timesheetWorkerPage.detach_confirm'),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: () => {
        store._delete({ department_id: v?.id }, () => {
          store.previewList = store.previewList.filter((x) => x.id !== v.id)
          store._department()
        })
      }
    })
  }

  const onAdd = () => store._attachSelected()

  const onSearchEv = (v) => {
    store.departmentParams.search = v
    store.departmentParams.page = 1
    store._department()
  }
  const onScrollEv = () => {
    store.departmentParams.page += 1
    store._department(true)
  }
</script>

<template>
  <UIModal v-model:visible="store.listVisible" :title="$t('content.edit')" :width="640">
    <!-- Yuqorida: bo'sh bo'limlardan tanlab qo'shish. -->
    <div class="mb-3 flex items-end gap-2">
      <div class="flex-1 min-w-0">
        <label class="mb-1 block text-xs font-medium text-secondary">
          {{ $t('timesheetWorkerPage.attach_department') }}
        </label>
        <SuperSelect
          multiple
          :options="store.departmentList"
          :loading="store.departmentLoading"
          :total-count="store.totalDepartmentCount"
          :per-page="store.departmentParams.per_page"
          v-model:value="store.payload.departments"
          v-model:search="store.departmentParams.search"
          value-field="id"
          @onSearch="onSearchEv"
          @onScrollEv="onScrollEv"
        />
      </div>
      <n-button
        type="primary"
        :loading="store.saveLoading"
        :disabled="store.payload.departments.length === 0"
        @click="onAdd"
      >
        {{ $t('content.add') }}
      </n-button>
    </div>
    <p
      v-if="!store.departmentLoading && store.departmentList.length === 0"
      class="-mt-2 mb-3 text-xs text-warning"
    >
      {{ $t('timesheetWorkerPage.free_departments_empty') }}
    </p>

    <!-- Pastda: biriktirilgan bo'limlar ro'yxati, har birida o'chirish. -->
    <div class="h-[420px] w-full overflow-y-auto rounded-lg border border-surface-line p-2">
      <template v-for="item in store.previewList" :key="item.id">
        <div class="mb-3 flex items-center rounded-lg bg-surface-ground p-1">
          <div class="w-[calc(100%-40px)] px-2">
            <span class="line-clamp-2 font-medium leading-[1.2]">{{ item?.department?.name }}</span>
            <span class="line-clamp-1 text-xs leading-[1.2] text-secondary">
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

      <p v-if="store.previewList.length === 0" class="!mt-[100px] w-full text-center text-secondary">
        {{ $t('content.no-data') }}
      </p>
    </div>
  </UIModal>
</template>
