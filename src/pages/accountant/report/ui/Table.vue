<script setup>
  import { UIStatus } from '@/components/index.js'
  import { useUploadReportStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { Info24Regular, ArrowCircleDown12Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useUploadReportStore()

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
    <div v-if="store.params?.organization_id" class="flex justify-between items-center mt-2">
      <span class="font-semibold text-xl"
        >{{ $t('content.historyUpload') }}
        <span class="text-primary" v-if="store.cards[store.selectedIndex]"
          >#{{ store.cards[store.selectedIndex]?.name }}</span
        ></span
      >
      <n-button @click="store._cards()" type="primary">{{ $t('content.refresh') }}</n-button>
    </div>
    <div class="w-full overflow-y-auto h-[calc(100vh-520px)] mt-4">
      <div class="grid grid-cols-2 gap-2">
        <template v-for="item in store.list" :key="item">
          <div class="col-span-1 bg-surface-section p-2 rounded-xl border border-surface-line">
            <div class="grid grid-cols-2">
              <div class="border-l-2 border-secondary pl-2">
                <h1 class="font-semibold text-xs">
                  {{ Utils.getMonthNameById(item.month) }} - {{ item.year }}
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
                  <template #icon>
                    <ArrowCircleDown12Regular />
                  </template>
                </n-button>
                <n-button
                  @click="showComment(item)"
                  size="small"
                  class="ml-2"
                  v-if="item.comment"
                  circle
                  secondary
                >
                  <template #icon>
                    <Info24Regular />
                  </template>
                </n-button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-x-2 mt-2">
              <div class="bg-surface-ground/40 p-2 rounded-md border-surface-line">
                <div class="text-xs text-secondary mb-1">{{ $t('content.status') }}</div>
                <div class="flex">
                  <UIStatus :status="item.status"></UIStatus>
                </div>
              </div>
              <div class="bg-surface-ground/40 p-2 rounded-md border-surface-line">
                <div class="text-xs text-secondary mb-1">{{ $t('content.process') }}</div>
                <div class="flex">
                  <UIStatus :status="statusList[item.done]"></UIStatus>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </n-spin>
</template>
