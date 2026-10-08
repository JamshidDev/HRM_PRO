<script setup>
  import { UIStatus } from '@/components/index.js'
  import { useUploadReportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    Info24Regular,
    ArrowCircleDown12Regular,
    ChevronDown24Regular,
    ArrowClockwise24Regular,
    History24Regular,
    Delete24Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUploadReportStore()

  // list backend'da id kamayish tartibida keladi → [0] = oxirgi (joriy) yuklama.
  const latest = computed(() => store.list?.[0] ?? null)
  const older = computed(() => store.list?.slice(1) ?? [])
  const showHistory = ref(false)
  const selectedCard = computed(() =>
    store.selectedIndex === null ? null : store.cards[store.selectedIndex]
  )

  const onDownload = (url) => {
    window.open(url, '_blank')
  }

  const showComment = (v) => {
    store.commentContent = v.comment
    store.commentVisible = true
  }

  const statusList = {
    1: {
      name: t('content.error'),
      id: 4
    },
    2: {
      name: t('content.process'),
      id: 1
    },
    3: {
      name: t('content.success'),
      id: 3
    }
  }
</script>

<template>
  <n-spin class="flex-1 min-h-0" content-class="h-full flex flex-col" :show="store.cardLoading">
    <div class="flex items-center justify-between gap-2 mt-4">
      <h2 class="text-base font-semibold flex items-center gap-2 min-w-0">
        <span class="shrink-0">{{ $t('content.historyUpload') }}</span>
        <span
          v-if="selectedCard"
          class="truncate px-2 h-6 inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium"
        >
          {{ selectedCard.name }}
        </span>
      </h2>
      <n-tooltip>
        <template #trigger>
          <n-button quaternary circle size="small" @click="store._cards()">
            <template #icon><ArrowClockwise24Regular /></template>
          </n-button>
        </template>
        {{ $t('content.refresh') }}
      </n-tooltip>
    </div>
    <div class="w-full flex-1 min-h-[200px] overflow-y-auto mt-3">
      <div
        v-if="!latest"
        class="h-full min-h-[200px] flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-surface-line text-center px-6"
      >
        <n-icon size="32" class="text-textColor3"><History24Regular /></n-icon>
        <span class="text-sm text-textColor3 max-w-[320px]">
          {{ $t(selectedCard ? 'uploadReport.ui.noUploads' : 'uploadReport.ui.selectType') }}
        </span>
      </div>
      <!-- Oxirgi (joriy) yuklama — ajratib ko'rsatiladi -->
      <div v-if="latest" class="bg-surface-section p-2 rounded-xl border-2 border-primary/40">
        <div class="grid grid-cols-2">
          <div class="border-l-2 border-primary pl-2">
            <h1 class="font-semibold text-xs flex items-center gap-1 flex-wrap">
              {{ Utils.getMonthNameById(latest.month) }} - {{ latest.year }}
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/15 text-success"
              >
                {{ $t('uploadReport.latest') }}
              </span>
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                :class="
                  latest.source === 2
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary/10 text-secondary'
                "
              >
                {{
                  latest.source === 2
                    ? $t('uploadReport.source.ones')
                    : $t('uploadReport.source.excel')
                }}
              </span>
            </h1>
            <div class="text-secondary text-xs">
              {{ Utils.timeOnlyDate(latest.created_at) }}
              {{ Utils.timeOnlyHour(latest.created_at) }}
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <n-button
              v-if="latest?.file"
              type="success"
              size="small"
              secondary
              circle
              @click="onDownload(latest.file)"
            >
              <template #icon><ArrowCircleDown12Regular /></template>
            </n-button>
            <n-button
              @click="showComment(latest)"
              size="small"
              class="ml-2"
              v-if="latest.comment"
              circle
              secondary
            >
              <template #icon><Info24Regular /></template>
            </n-button>
            <n-popconfirm
              v-if="latest.status !== 3"
              @positive-click="store._deleteUpload(latest.id)"
            >
              <template #trigger>
                <n-button
                  type="error"
                  size="small"
                  secondary
                  circle
                  :loading="store.deleteLoading"
                >
                  <template #icon><Delete24Regular /></template>
                </n-button>
              </template>
              {{ $t('content.confirmDelete') }}
            </n-popconfirm>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-2 mt-2">
          <div class="bg-surface-ground/40 p-2 rounded-md border-surface-line">
            <div class="text-xs text-secondary mb-1">{{ $t('content.status') }}</div>
            <div class="flex"><UIStatus :status="latest.status"></UIStatus></div>
          </div>
          <div class="bg-surface-ground/40 p-2 rounded-md border-surface-line">
            <div class="text-xs text-secondary mb-1">{{ $t('content.process') }}</div>
            <div class="flex"><UIStatus :status="statusList[latest.done]"></UIStatus></div>
          </div>
        </div>
        <!-- 1C dan qayta tortishda eski↔yangi o'zgarishlar (sonlar mavjud bo'lsa) -->
        <div v-if="latest.added_count != null" class="flex flex-wrap gap-1 mt-2">
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success">
            {{ $t('uploadReport.changes.added') }}: {{ latest.added_count }}
          </span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-warning/10 text-warning">
            {{ $t('uploadReport.changes.changed') }}: {{ latest.changed_count }}
          </span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-error/10 text-error">
            {{ $t('uploadReport.changes.removed') }}: {{ latest.removed_count }}
          </span>
          <span
            class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary/10 text-secondary"
          >
            {{ $t('uploadReport.changes.unchanged') }}: {{ latest.unchanged_count }}
          </span>
        </div>
      </div>

      <!-- Oldingi yuklamalar (tarix) — yig'iladigan -->
      <div v-if="older.length" class="mt-3">
        <n-button text size="small" class="mb-2" @click="showHistory = !showHistory">
          <template #icon>
            <n-icon
              class="transition-transform"
              :style="{ transform: showHistory ? 'rotate(180deg)' : 'none' }"
            >
              <ChevronDown24Regular />
            </n-icon>
          </template>
          {{ $t('uploadReport.olderUploads') }} ({{ older.length }})
        </n-button>

        <div v-if="showHistory" class="grid grid-cols-2 gap-2 opacity-90">
          <template v-for="item in older" :key="item.id">
            <div class="col-span-1 bg-surface-section p-2 rounded-xl border border-surface-line">
              <div class="grid grid-cols-2">
                <div class="border-l-2 border-secondary pl-2">
                  <h1 class="font-semibold text-xs flex items-center gap-1 flex-wrap">
                    {{ Utils.getMonthNameById(item.month) }} - {{ item.year }}
                    <span
                      class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      :class="
                        item.source === 2
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary/10 text-secondary'
                      "
                    >
                      {{
                        item.source === 2
                          ? $t('uploadReport.source.ones')
                          : $t('uploadReport.source.excel')
                      }}
                    </span>
                  </h1>
                  <div class="text-secondary text-xs">
                    {{ Utils.timeOnlyDate(item.created_at) }}
                    {{ Utils.timeOnlyHour(item.created_at) }}
                  </div>
                </div>
                <div class="flex justify-end gap-2">
                  <n-button
                    v-if="item?.file"
                    type="success"
                    size="small"
                    secondary
                    circle
                    @click="onDownload(item.file)"
                  >
                    <template #icon><ArrowCircleDown12Regular /></template>
                  </n-button>
                  <n-button
                    @click="showComment(item)"
                    size="small"
                    class="ml-2"
                    v-if="item.comment"
                    circle
                    secondary
                  >
                    <template #icon><Info24Regular /></template>
                  </n-button>
                  <n-popconfirm
                    v-if="item.status !== 3"
                    @positive-click="store._deleteUpload(item.id)"
                  >
                    <template #trigger>
                      <n-button
                        type="error"
                        size="small"
                        secondary
                        circle
                        :loading="store.deleteLoading"
                      >
                        <template #icon><Delete24Regular /></template>
                      </n-button>
                    </template>
                    {{ $t('content.confirmDelete') }}
                  </n-popconfirm>
                </div>
              </div>
              <div class="mt-2">
                <div class="bg-surface-ground/40 p-2 rounded-md border-surface-line">
                  <div class="text-xs text-secondary mb-1">{{ $t('content.process') }}</div>
                  <div class="flex"><UIStatus :status="statusList[item.done]"></UIStatus></div>
                </div>
              </div>
              <div v-if="item.added_count != null" class="flex flex-wrap gap-1 mt-2">
                <span
                  class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success"
                >
                  {{ $t('uploadReport.changes.added') }}: {{ item.added_count }}
                </span>
                <span
                  class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-warning/10 text-warning"
                >
                  {{ $t('uploadReport.changes.changed') }}: {{ item.changed_count }}
                </span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-error/10 text-error">
                  {{ $t('uploadReport.changes.removed') }}: {{ item.removed_count }}
                </span>
                <span
                  class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary/10 text-secondary"
                >
                  {{ $t('uploadReport.changes.unchanged') }}: {{ item.unchanged_count }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </n-spin>
</template>
