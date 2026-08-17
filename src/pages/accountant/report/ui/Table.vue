<script setup>
  import { UIStatus, UIPageTitle } from '@/components/index.js'
  import { useUploadReportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import {
    Info24Regular,
    ArrowCircleDown12Regular,
    ChevronDown24Regular
  } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUploadReportStore()

  // list backend'da id kamayish tartibida keladi → [0] = oxirgi (joriy) yuklama.
  const latest = computed(() => store.list?.[0] ?? null)
  const older = computed(() => store.list?.slice(1) ?? [])
  const showHistory = ref(false)

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
  <n-spin :show="store.cardLoading">
    <UIPageTitle v-if="store.params?.organization_id" class="mt-2">
      <template #title>
        {{ $t('content.historyUpload') }}
        <span class="text-primary" v-if="store.cards[store.selectedIndex]"
          >#{{ store.cards[store.selectedIndex]?.name }}</span
        >
      </template>
      <template #actions>
        <n-button @click="store._cards()" type="primary">{{ $t('content.refresh') }}</n-button>
      </template>
    </UIPageTitle>
    <div class="w-full overflow-y-auto h-[calc(100vh-520px)] mt-4">
      <!-- Oxirgi (joriy) yuklama — ajratib ko'rsatiladi -->
      <div
        v-if="latest"
        class="bg-surface-section p-2 rounded-xl border-2 border-primary/40"
      >
        <div class="grid grid-cols-2">
          <div class="border-l-2 border-primary pl-2">
            <h1 class="font-semibold text-xs flex items-center gap-1 flex-wrap">
              {{ Utils.getMonthNameById(latest.month) }} - {{ latest.year }}
              <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/15 text-success">
                {{ $t('uploadReport.latest') }}
              </span>
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                :class="latest.source === 2 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'"
              >
                {{ latest.source === 2 ? $t('uploadReport.source.ones') : $t('uploadReport.source.excel') }}
              </span>
            </h1>
            <div class="text-secondary text-xs">
              {{ Utils.timeOnlyDate(latest.created_at) }} {{ Utils.timeOnlyHour(latest.created_at) }}
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <n-button v-if="latest?.file" type="success" size="small" secondary circle @click="onDownload(latest.file)">
              <template #icon><ArrowCircleDown12Regular /></template>
            </n-button>
            <n-button @click="showComment(latest)" size="small" class="ml-2" v-if="latest.comment" circle secondary>
              <template #icon><Info24Regular /></template>
            </n-button>
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
                      :class="item.source === 2 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'"
                    >
                      {{ item.source === 2 ? $t('uploadReport.source.ones') : $t('uploadReport.source.excel') }}
                    </span>
                  </h1>
                  <div class="text-secondary text-xs">
                    {{ Utils.timeOnlyDate(item.created_at) }} {{ Utils.timeOnlyHour(item.created_at) }}
                  </div>
                </div>
                <div class="flex justify-end gap-2">
                  <n-button v-if="item?.file" type="success" size="small" secondary circle @click="onDownload(item.file)">
                    <template #icon><ArrowCircleDown12Regular /></template>
                  </n-button>
                  <n-button @click="showComment(item)" size="small" class="ml-2" v-if="item.comment" circle secondary>
                    <template #icon><Info24Regular /></template>
                  </n-button>
                </div>
              </div>
              <div class="mt-2">
                <div class="bg-surface-ground/40 p-2 rounded-md border-surface-line">
                  <div class="text-xs text-secondary mb-1">{{ $t('content.process') }}</div>
                  <div class="flex"><UIStatus :status="statusList[item.done]"></UIStatus></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </n-spin>
</template>
