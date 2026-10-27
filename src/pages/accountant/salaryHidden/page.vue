<script setup>
  import { UIPageContent, UIPageFilter, UIPagination } from '@/components/index.js'
  import { Delete24Regular, EyeOff24Regular, Eye24Regular } from '@vicons/fluent'
  import { useAccountStore, useSalaryHiddenStore } from '@/store/modules/index.js'
  import { useDebounceFn } from '@vueuse/core'

  const store = useSalaryHiddenStore()
  const accStore = useAccountStore()

  const canRead = computed(() =>
    accStore.checkPermission(accStore.pn.economistSalaryHiddenRead)
  )
  const canWrite = computed(() =>
    accStore.checkPermission(accStore.pn.economistSalaryHiddenWrite)
  )

  const activeTab = ref('hidden')

  onMounted(() => {
    if (!canRead.value) return
    store._index()
    // Granter bo'lsa viewers yuklanadi (200) va "Ko'ra oladiganlar" tab paydo bo'ladi;
    // granter bo'lmasa 403 → tab yashirin.
    store._viewers()
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

  const confirmRemoveViewer = (row) => {
    window.$dialog.warning({
      title: "O'chirishni tasdiqlang",
      content: `${row.fio || row.pinfl} ni ko'ruvchilar ro'yxatidan olib tashlaysizmi?`,
      positiveText: "O'chirish",
      negativeText: 'Bekor qilish',
      onPositiveClick: () => store._removeViewer(row.id)
    })
  }

  // Xodimni ism/PINFL bo'yicha qidirish (yozish o'rniga tanlab yashirish/belgilash).
  const onWorkerSearch = useDebounceFn((q) => store._searchWorkers(q), 300)
  // Viewer tanlashda "allaqachon yashirilgan" cheklovi qo'llanmaydi (ko'ruvchi istalgan xodim).
  const viewerWorkerOptions = computed(() =>
    store.workerOptions.map((o) => ({ ...o, disabled: false }))
  )
</script>

<template>
  <UIPageContent>
    <n-tabs v-model:value="activeTab" type="line" animated class="mb-2">
      <!-- ─── Yashirilganlar ─────────────────────────────────────────────── -->
      <n-tab-pane name="hidden" :tab="$t('salaryHidden.tabHidden')">
        <UIPageFilter
          v-model:search="store.search"
          :placeholder="$t('salaryHidden.searchPlaceholder')"
          :show-filter-button="false"
          :show-add-button="canWrite"
          :add-button-title="$t('salaryHidden.addButton')"
          @on-add="store.showForm = true"
          @on-search="onSearch"
        />

        <transition name="fade">
          <div
            v-if="store.showForm && canWrite"
            class="mb-4 p-4 rounded-xl border border-surface-line bg-surface-section flex flex-wrap gap-3 items-end"
          >
            <div class="flex flex-col gap-1 flex-1 min-w-[260px]">
              <span class="text-xs text-textColor3">{{ $t('salaryHidden.searchWorker') }}</span>
              <n-select
                :value="store.form.pinfl || null"
                filterable
                remote
                clearable
                :options="store.workerOptions"
                :loading="store.workerSearchLoading"
                :placeholder="$t('salaryHidden.searchWorkerPlaceholder')"
                :clear-filter-after-select="false"
                @search="onWorkerSearch"
                @update:value="(v) => (store.form.pinfl = v || '')"
              />
            </div>
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
              <n-button
                @click="store.showForm = false; store.form.pinfl = ''; store.form.note = ''"
              >
                {{ $t('content.cancel') }}
              </n-button>
            </div>
          </div>
        </transition>

        <n-spin :show="store.loading">
          <n-table :single-line="false" size="small" class="mt-1">
            <thead>
              <tr>
                <th class="w-[60px] !text-center">#</th>
                <th>{{ $t('content.fullName') }}</th>
                <th>{{ $t('content.organization') }}</th>
                <th>{{ $t('salaryHidden.note') }}</th>
                <th>{{ $t('salaryHidden.addedAt') }}</th>
                <th v-if="canWrite" class="w-[80px] !text-center">
                  {{ $t('salaryHidden.actions') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in store.list" :key="row.id">
                <td class="!text-center text-textColor3 text-sm">
                  {{ (store.currentPage - 1) * 20 + idx + 1 }}
                </td>
                <td>
                  <div class="flex flex-col">
                    <span class="font-medium">{{ row.fio || '—' }}</span>
                    <span class="font-mono text-xs text-textColor3">{{ row.pinfl }}</span>
                  </div>
                </td>
                <td class="text-sm text-textColor2">{{ row.organization?.name || '—' }}</td>
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
                <td :colspan="canWrite ? 6 : 5" class="!py-12 !text-center text-textColor3">
                  <div class="flex flex-col items-center gap-2">
                    <n-icon size="40" class="text-textColor3 opacity-40">
                      <EyeOff24Regular />
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
      </n-tab-pane>

      <!-- ─── Ko'ra oladiganlar (faqat granter) ──────────────────────────── -->
      <n-tab-pane
        v-if="store.canManageViewers"
        name="viewers"
        :tab="$t('salaryHidden.tabViewers')"
      >
        <p class="mb-3 text-xs text-textColor3">{{ $t('salaryHidden.viewersHint') }}</p>

        <div
          class="mb-4 p-4 rounded-xl border border-surface-line bg-surface-section flex flex-wrap gap-3 items-end"
        >
          <div class="flex flex-col gap-1 flex-1 min-w-[260px]">
            <span class="text-xs text-textColor3">{{ $t('salaryHidden.searchWorker') }}</span>
            <n-select
              :value="store.viewerForm.pinfl || null"
              filterable
              remote
              clearable
              :options="viewerWorkerOptions"
              :loading="store.workerSearchLoading"
              :placeholder="$t('salaryHidden.searchWorkerPlaceholder')"
              :clear-filter-after-select="false"
              @search="onWorkerSearch"
              @update:value="(v) => (store.viewerForm.pinfl = v || '')"
            />
          </div>
          <div class="flex flex-col gap-1 flex-1 min-w-[180px]">
            <span class="text-xs text-textColor3">{{ $t('salaryHidden.pinfl') }}</span>
            <n-input
              v-model:value="store.viewerForm.pinfl"
              :placeholder="$t('salaryHidden.pinflPlaceholder')"
              maxlength="14"
              clearable
            />
          </div>
          <div class="flex flex-col gap-1 flex-1 min-w-[220px]">
            <span class="text-xs text-textColor3">{{ $t('salaryHidden.note') }}</span>
            <n-input
              v-model:value="store.viewerForm.note"
              :placeholder="$t('salaryHidden.notePlaceholder')"
              clearable
            />
          </div>
          <div class="flex gap-2">
            <n-button
              type="primary"
              :loading="store.viewerCreateLoading"
              :disabled="store.viewerForm.pinfl.length !== 14"
              @click="store._addViewer()"
            >
              {{ $t('content.save') }}
            </n-button>
          </div>
        </div>

        <n-spin :show="store.viewerLoading">
          <n-table :single-line="false" size="small" class="mt-1">
            <thead>
              <tr>
                <th class="w-[60px] !text-center">#</th>
                <th>{{ $t('content.fullName') }}</th>
                <th>{{ $t('salaryHidden.note') }}</th>
                <th>{{ $t('salaryHidden.addedAt') }}</th>
                <th class="w-[80px] !text-center">{{ $t('salaryHidden.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in store.viewerList" :key="row.id">
                <td class="!text-center text-textColor3 text-sm">
                  {{ (store.viewerPage - 1) * 20 + idx + 1 }}
                </td>
                <td>
                  <div class="flex flex-col">
                    <span class="font-medium">{{ row.fio || '—' }}</span>
                    <span class="font-mono text-xs text-textColor3">{{ row.pinfl || '—' }}</span>
                  </div>
                </td>
                <td class="text-sm text-textColor2">{{ row.note || '—' }}</td>
                <td class="text-sm text-textColor3">{{ row.created_at?.slice(0, 16) || '—' }}</td>
                <td class="!text-center">
                  <n-button
                    text
                    type="error"
                    size="small"
                    :loading="store.viewerDeleteLoading"
                    @click="confirmRemoveViewer(row)"
                  >
                    <template #icon><n-icon><Delete24Regular /></n-icon></template>
                  </n-button>
                </td>
              </tr>
              <tr v-if="!store.viewerList.length && !store.viewerLoading">
                <td colspan="5" class="!py-12 !text-center text-textColor3">
                  <div class="flex flex-col items-center gap-2">
                    <n-icon size="40" class="text-textColor3 opacity-40">
                      <Eye24Regular />
                    </n-icon>
                    <span class="text-sm">{{ $t('content.no-data') }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </n-table>
        </n-spin>

        <UIPagination
          v-if="store.viewerTotal > 20"
          class="mt-4"
          :total="store.viewerTotal"
          :page="store.viewerPage"
          :page-size="20"
          @update:page="store._viewers($event)"
        />
      </n-tab-pane>
    </n-tabs>
  </UIPageContent>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
