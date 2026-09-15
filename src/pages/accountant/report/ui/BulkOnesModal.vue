<script setup>
  import { UIModal, UIYearMonth } from '@/components/index.js'
  import { useUploadReportStore, useComponentStore } from '@/store/modules/index.js'
  import { Search24Regular } from '@vicons/fluent'
  import Utils from '@/utils/Utils.js'

  const store = useUploadReportStore()
  const componentStore = useComponentStore()

  // Oylik (type=1) → korxona ostида xodim soni + summa; INPS (2/3/4) → 1C kodi.
  const isStatement = computed(() => Number(store.bulkType) === 1)

  // Hisobot turi o'zgarsa — tanlovni tozalab, mos org ro'yxatini qayta yuklaymiz.
  const onTypeChange = () => store._changeBulkPeriod()

  onMounted(() => {
    if (!componentStore.uploadTypes?.length) componentStore._enumAccountant()
  })

  // Qidiruv bo'yicha filtrlangan korxonalar (nomi bo'yicha).
  const filtered = computed(() => {
    const q = (store.bulkSearch || '').trim().toLowerCase()
    if (!q) return store.bulkOrgs
    return store.bulkOrgs.filter((o) => (o.organization || '').toLowerCase().includes(q))
  })

  const allSelected = computed(
    () =>
      filtered.value.length > 0 &&
      filtered.value.every((o) => store.bulkSelected.includes(o.organization_id))
  )
  const someSelected = computed(
    () =>
      filtered.value.some((o) => store.bulkSelected.includes(o.organization_id)) &&
      !allSelected.value
  )

  const toggleAll = (checked) => {
    const ids = filtered.value.map((o) => o.organization_id)
    if (checked) {
      const set = new Set([...store.bulkSelected, ...ids])
      store.bulkSelected = [...set]
    } else {
      store.bulkSelected = store.bulkSelected.filter((id) => !ids.includes(id))
    }
  }

  const toggleOne = (id, checked) => {
    if (checked) {
      if (!store.bulkSelected.includes(id)) store.bulkSelected = [...store.bulkSelected, id]
    } else {
      store.bulkSelected = store.bulkSelected.filter((x) => x !== id)
    }
  }

  const isSelected = (id) => store.bulkSelected.includes(id)
  const resultOf = (id) => store.bulkResults[id]

  const okCount = computed(
    () => Object.values(store.bulkResults).filter((r) => r.status === 'done').length
  )
  const failCount = computed(
    () => Object.values(store.bulkResults).filter((r) => r.status === 'failed').length
  )
  const finished = computed(
    () =>
      !store.bulkRunning && store.bulkProgress.total > 0 && store.bulkProgress.done >= store.bulkProgress.total
  )

  const onUpload = () => {
    if (store.bulkSelected.length === 0) return
    store._bulkUploadFromOnes()
  }
</script>

<template>
  <UIModal :width="680" v-model:visible="store.bulkVisible" :title="$t('uploadReport.bulkOnes.title')">
    <div class="flex flex-col gap-2">
      <p class="text-xs text-secondary px-1">{{ $t('uploadReport.bulkOnes.hint') }}</p>

      <!-- Hisobot turi — qaysi hisobot ommaviy tortiladi -->
      <div>
        <label class="text-xs text-secondary mb-1 block px-1">
          {{ $t('uploadReport.form.type') }}
        </label>
        <n-select
          v-model:value="store.bulkType"
          :options="componentStore.uploadTypes"
          label-field="name"
          value-field="id"
          :loading="componentStore.accountantEnumLoading"
          :disabled="store.bulkRunning"
          @update:value="onTypeChange"
        />
      </div>

      <!-- Davr — qaysi oy uchun yuklanadi (o'zgarsa ro'yxat qayta yuklanadi) -->
      <div>
        <label class="text-xs text-secondary mb-1 block px-1">
          {{ $t('uploadReport.bulkOnes.period') }}
        </label>
        <UIYearMonth
          v-model:year="store.bulkPeriod.year"
          v-model:month="store.bulkPeriod.month"
          :clearable="false"
          :disabled="store.bulkRunning"
          @change="store._changeBulkPeriod()"
        />
      </div>

      <n-input
        v-model:value="store.bulkSearch"
        :placeholder="$t('uploadReport.bulkOnes.search')"
        clearable
      >
        <template #prefix>
          <n-icon><Search24Regular /></n-icon>
        </template>
      </n-input>

      <n-spin :show="store.bulkLoading">
        <div
          v-if="!store.bulkLoading && store.bulkOrgs.length === 0"
          class="text-center text-sm text-secondary py-8"
        >
          {{ $t('uploadReport.bulkOnes.noData') }}
        </div>

        <template v-else>
          <!-- Barchasini tanlash -->
          <div class="flex items-center justify-between px-1 py-2 border-b border-surface-line">
            <n-checkbox
              :checked="allSelected"
              :indeterminate="someSelected"
              :disabled="store.bulkRunning"
              @update:checked="toggleAll"
            >
              {{ $t('uploadReport.bulkOnes.selectAll') }}
            </n-checkbox>
            <span class="text-xs text-secondary">
              {{ store.bulkSelected.length }} / {{ filtered.length }}
              {{ $t('uploadReport.bulkOnes.selected') }}
            </span>
          </div>

          <!-- Korxonalar ro'yxati -->
          <n-scrollbar style="max-height: 320px">
            <div
              v-for="o in filtered"
              :key="o.organization_id"
              class="flex items-center gap-2 px-1 py-2 border-b border-surface-line/60 hover:bg-surface-ground/40 rounded"
            >
              <n-checkbox
                :checked="isSelected(o.organization_id)"
                :disabled="store.bulkRunning"
                @update:checked="(c) => toggleOne(o.organization_id, c)"
              />
              <div class="flex-1 min-w-0">
                <div class="text-sm truncate">{{ o.organization }}</div>
                <div class="text-xs text-secondary">
                  <template v-if="isStatement">
                    {{ o.employee_count }} {{ $t('uploadReport.bulkOnes.employees') }} ·
                    {{ Utils.formatNumberToMoney(o.net_total) }}
                  </template>
                  <template v-else>{{ o.ones_org_code }}</template>
                </div>
              </div>
              <div class="shrink-0">
                <n-tag
                  v-if="resultOf(o.organization_id)?.status === 'uploading'"
                  size="small"
                  type="warning"
                  round
                >
                  {{ $t('uploadReport.bulkOnes.uploading') }}
                </n-tag>
                <n-tag
                  v-else-if="resultOf(o.organization_id)?.status === 'done'"
                  size="small"
                  type="success"
                  round
                >
                  {{ $t('uploadReport.bulkOnes.done') }}
                </n-tag>
                <n-tooltip
                  v-else-if="resultOf(o.organization_id)?.status === 'failed'"
                  trigger="hover"
                >
                  <template #trigger>
                    <n-tag size="small" type="error" round>
                      {{ $t('uploadReport.bulkOnes.failed') }}
                    </n-tag>
                  </template>
                  {{ resultOf(o.organization_id)?.message }}
                </n-tooltip>
              </div>
            </div>
          </n-scrollbar>
        </template>
      </n-spin>

      <!-- Progress -->
      <div v-if="store.bulkProgress.total > 0" class="px-1">
        <n-progress
          type="line"
          :percentage="Math.round((store.bulkProgress.done / store.bulkProgress.total) * 100)"
          :indicator-placement="'inside'"
          :status="finished ? (failCount ? 'warning' : 'success') : 'default'"
        />
        <div class="text-xs text-secondary mt-1 flex justify-between">
          <span>
            {{ $t('uploadReport.bulkOnes.progress', { done: store.bulkProgress.done, total: store.bulkProgress.total }) }}
          </span>
          <span v-if="finished">
            {{ $t('uploadReport.bulkOnes.summary', { ok: okCount, fail: failCount }) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Yuklash ketayotganda: modalni yopsa ham fonda davom etadi -->
    <p v-if="store.bulkRunning" class="text-xs text-secondary mt-3 px-1">
      {{ $t('uploadReport.bulkOnes.background') }}
    </p>

    <div class="grid grid-cols-2 gap-2 mt-4">
      <!-- Yugurish paytida — To'xtatish (yangi korxonalar olinmaydi); aks holda — Yopish -->
      <n-button v-if="store.bulkRunning" @click="store.stopBulk()" type="error">
        {{ $t('uploadReport.bulkOnes.stop') }}
      </n-button>
      <n-button v-else @click="store.bulkVisible = false" type="error" ghost>
        {{ $t('uploadReport.bulkOnes.close') }}
      </n-button>
      <n-button
        @click="onUpload"
        :loading="store.bulkRunning"
        :disabled="store.bulkSelected.length === 0 || store.bulkRunning"
        type="primary"
      >
        {{ $t('uploadReport.bulkOnes.upload') }} ({{ store.bulkSelected.length }})
      </n-button>
    </div>
  </UIModal>
</template>

<style scoped></style>
