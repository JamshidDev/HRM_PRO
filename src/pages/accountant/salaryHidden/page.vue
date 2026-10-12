<script setup>
import { UIPageContent, UIPageFilter, UIPagination } from '@/components/index.js'
import { Add24Regular, Delete24Regular, EyeHide24Regular } from '@vicons/fluent'
import { useAccountStore, useSalaryHiddenStore } from '@/store/modules/index.js'
import { useDebounceFn } from '@vueuse/core'

const store = useSalaryHiddenStore()
const accStore = useAccountStore()

const canRead = computed(() => accStore.checkPermission(accStore.pn.economistSalaryHiddenRead))
const canWrite = computed(() => accStore.checkPermission(accStore.pn.economistSalaryHiddenWrite))

onMounted(() => {
  if (!canRead.value) return
  store._index()
})

const onSearch = useDebounceFn(() => store._index(1), 350)

const confirmDelete = (row) => {
  window.$dialog.warning({
    title: "O'chirishni tasdiqlang",
    content: `PINFL ${row.pinfl} ni ro'yxatdan olib tashlaysizmi?`,
    positiveText: "O'chirish",
    negativeText: 'Bekor qilish',
    onPositiveClick: () => store._delete(row.id)
  })
}
</script>

<template>
  <UIPageContent>
    <UIPageFilter
      v-model:search="store.search"
      :placeholder="$t('salaryHidden.searchPlaceholder')"
      :show-filter-button="false"
      :show-add-button="canWrite"
      :add-button-label="$t('salaryHidden.addButton')"
      @add="store.showForm = true"
      @update:search="onSearch"
    />

    <!-- Qo'shish formasi -->
    <transition name="fade">
      <div
        v-if="store.showForm && canWrite"
        class="mb-4 p-4 rounded-xl border border-surface-line bg-surface-section flex flex-wrap gap-3 items-end"
      >
        <div class="flex flex-col gap-1 flex-1 min-w-[180px]">
          <span class="text-xs text-textColor3">{{ $t('salaryHidden.pinfl') }}</span>
          <n-input
            v-model:value="store.form.pinfl"
            :placeholder="$t('salaryHidden.pinflPlaceholder')"
            maxlength="14"
            clearable
          />
        </div>
        <div class="flex flex-col gap-1 flex-1 min-w-[220px]">
          <span class="text-xs text-textColor3">{{ $t('salaryHidden.note') }}</span>
          <n-input
            v-model:value="store.form.note"
            :placeholder="$t('salaryHidden.notePlaceholder')"
            clearable
          />
        </div>
        <div class="flex gap-2">
          <n-button
            type="primary"
            :loading="store.createLoading"
            :disabled="store.form.pinfl.length !== 14"
            @click="store._create()"
          >
            {{ $t('content.save') }}
          </n-button>
          <n-button @click="store.showForm = false; store.form.pinfl = ''; store.form.note = ''">
            {{ $t('content.cancel') }}
          </n-button>
        </div>
      </div>
    </transition>

    <!-- Jadval -->
    <n-spin :show="store.loading">
      <n-table :single-line="false" size="small" class="mt-1">
        <thead>
          <tr>
            <th class="w-[60px] !text-center">#</th>
            <th>PINFL</th>
            <th>{{ $t('salaryHidden.note') }}</th>
            <th>{{ $t('salaryHidden.addedAt') }}</th>
            <th v-if="canWrite" class="w-[80px] !text-center">{{ $t('salaryHidden.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in store.list" :key="row.id">
            <td class="!text-center text-textColor3 text-sm">
              {{ (store.currentPage - 1) * 20 + idx + 1 }}
            </td>
            <td>
              <span class="font-mono font-medium">{{ row.pinfl }}</span>
            </td>
            <td class="text-sm text-textColor2">{{ row.note || '—' }}</td>
            <td class="text-sm text-textColor3">{{ row.created_at?.slice(0, 16) || '—' }}</td>
            <td v-if="canWrite" class="!text-center">
              <n-button
                text
                type="error"
                size="small"
                :loading="store.deleteLoading"
                @click="confirmDelete(row)"
              >
                <template #icon><n-icon><Delete24Regular /></n-icon></template>
              </n-button>
            </td>
          </tr>
          <tr v-if="!store.list.length && !store.loading">
            <td :colspan="canWrite ? 5 : 4" class="!py-12 !text-center text-textColor3">
              <div class="flex flex-col items-center gap-2">
                <n-icon size="40" class="text-textColor3 opacity-40">
                  <EyeHide24Regular />
                </n-icon>
                <span class="text-sm">{{ $t('content.no-data') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </n-table>
    </n-spin>

    <UIPagination
      v-if="store.total > 20"
      class="mt-4"
      :total="store.total"
      :page="store.currentPage"
      :page-size="20"
      @update:page="store._index($event)"
    />
  </UIPageContent>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
