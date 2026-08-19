<script setup>
  import { useMonthReportStore } from '@/store/modules/index.js'
  import { UIYearMonth } from '@/components/index.js'
  import { useAppSetting, Utils } from '@/utils/index.js'
  import {
    ArrowCircleRight16Filled,
    ArrowCircleLeft20Filled,
    ArrowFit16Filled
  } from '@vicons/fluent'

  const store = useMonthReportStore()
  const currentIndex = ref(1)
  const photoUrl = computed(() => store.workerPhotoUrl || useAppSetting.noAvailableImage)

  const totalItem = computed(() => store.showList.length)
  const currentItem = computed(() => store.showList[currentIndex.value - 1])

  watch(
    () => store.showList,
    () => {
      currentIndex.value = 1
    }
  )

  const next = () => {
    if (currentIndex.value < totalItem.value) currentIndex.value++
  }

  const prev = () => {
    if (currentIndex.value > 1) currentIndex.value--
  }
</script>

<template>
  <div>
    <div class="grid grid-cols-12">
      <div class="col-span-12 h-[calc(100vh-120px)] overflow-auto">
        <n-spin class="w-full min-h-[660px]" :show="store.showLoading">
          <div
            class="w-full grid grid-cols-12 border border-surface-line rounded-lg px-4 py-2 mb-4"
          >
            <div class="col-span-4 flex items-center">
              <template v-if="store.showList.length > 0">
                <span class="text-textColor3">{{ $t('content.total', { n: totalItem }) }}</span>
                <n-icon class="text-warning mx-4" size="30">
                  <ArrowFit16Filled />
                </n-icon>
                <span class="text-2xl font-semibold text-primary">{{ currentIndex }}</span>
              </template>
            </div>
            <div class="col-span-4 flex justify-center gap-4 items-center">
              <div class="w-full! md:w-[220px]!">
                <UIYearMonth
                  v-model:year="store.showPrams.year"
                  v-model:month="store.showPrams.month"
                  :clearable="false"
                  @change="store._show"
                />
              </div>
            </div>
            <div class="col-span-4 flex justify-end gap-4">
              <template v-if="store.showList.length > 1">
                <n-button :disabled="totalItem === 1" @click="prev" type="error" size="small">
                  {{ $t('content.preview') }}
                  <template #icon>
                    <ArrowCircleLeft20Filled />
                  </template>
                </n-button>
                <n-button
                  :disabled="totalItem === 1"
                  @click="next"
                  type="primary"
                  size="small"
                  icon-placement="right"
                >
                  {{ $t('content.next') }}
                  <template #icon>
                    <ArrowCircleRight16Filled />
                  </template>
                </n-button>
              </template>
            </div>
          </div>
          <template v-if="store.showList.length === 0 && store.cashedWorkerData">
            <n-table :single-line="false" size="small">
              <thead>
                <tr>
                  <th colspan="3">
                    <div class="flex">
                      <div class="w-[120px] p-2">
                        <img
                          class="w-full rounded-lg border border-surface-line"
                          :src="photoUrl"
                          @error="Utils.onImgError"
                          alt="no photo"
                        />
                      </div>
                      <div class="grid grid-cols-12 px-2 pt-2 w-[calc(100%-120px)]">
                        <div class="col-span-12 font-semibold text-lg mb-2">
                          {{ store.cashedWorkerData?.full_name }}
                        </div>
                        <div class="col-span-12 !text-wrap leading-[1.2]">
                          <span class="text-primary">{{ $t('content.organization') }}: </span>
                          {{ store.cashedWorkerData?.organization }}
                        </div>
                        <div class="col-span-12">
                          <span class="text-primary">{{ $t('content.position') }}: </span>
                          {{ store.cashedWorkerData?.position }}
                        </div>
                        <div class="col-span-12">
                          <span class="text-primary">{{ $t('monthReport.view.main_salary') }}: </span>-:-
                        </div>
                        <div class="col-span-6">
                          <span class="text-primary">{{ $t('monthReport.view.work_time') }}: </span>-:-
                        </div>
                        <div class="col-span-6 flex gap-4 justify-end"></div>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
            </n-table>
          </template>

          <div v-if="currentItem">
            <n-table :single-line="false" size="small">
              <thead>
                <tr>
                  <th colspan="3">
                    <div class="flex">
                      <div class="w-[120px] p-2">
                        <img
                          class="w-full rounded-lg border border-surface-line"
                          :src="photoUrl"
                          @error="Utils.onImgError"
                          alt="no photo"
                        />
                      </div>
                      <div class="grid grid-cols-12 px-2 pt-2 w-[calc(100%-120px)]">
                        <div class="col-span-12 font-semibold text-lg mb-2">
                          {{ currentItem.worker?.full_name }}
                        </div>
                        <div class="col-span-12 !text-wrap leading-[1.2]">
                          <span class="text-primary">{{ $t('content.organization') }}: </span>
                          {{ currentItem.worker?.organization }}
                        </div>
                        <div class="col-span-12">
                          <span class="text-primary">{{ $t('content.position') }}: </span>
                          {{ currentItem.worker?.position }}
                        </div>
                        <div class="col-span-12">
                          <span class="text-primary">{{ $t('monthReport.view.main_salary') }}:
                          </span>
                          {{ currentItem.worker?.main_salary }}
                        </div>
                        <div class="col-span-6">
                          <span class="text-primary">{{ $t('monthReport.view.work_time') }}:
                          </span>
                          {{ currentItem.worker?.work_time }} {{ $t('content.hour') }}
                        </div>
                        <div class="col-span-6 flex gap-4 justify-end"></div>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
            </n-table>
            <n-table class="mt-4" :single-line="false" size="small">
              <tbody>
                <tr>
                  <td class="w-[120px] font-semibold py-0!">{{ $t('monthReport.in.code') }}</td>
                  <td class="font-semibold py-0!">{{ $t('monthReport.in.type') }}</td>
                  <td class="w-[120px] font-semibold py-0!">{{ $t('monthReport.in.amount') }}</td>
                </tr>
                <tr v-for="(card, index) in currentItem.in" :key="index">
                  <td class="w-[120px] font-semibold py-0!">{{ card.code }}</td>
                  <td class="py-0!">{{ card.type }}</td>
                  <td class="font-semibold py-0!">{{ card.amount }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="py-0!">
                    <span class="text-primary text-center block font-semibold">{{
                      $t('monthReport.in.total')
                    }}</span>
                  </td>
                  <td class="font-semibold py-0!">{{ currentItem.in_total }}</td>
                </tr>
              </tbody>
            </n-table>
            <n-table class="mt-4" :single-line="false" size="small">
              <tbody>
                <tr>
                  <td class="w-[120px] font-semibold py-0!">{{ $t('monthReport.in.code') }}</td>
                  <td class="font-semibold py-0!">{{ $t('monthReport.in.type') }}</td>
                  <td class="w-[120px] font-semibold py-0!">{{ $t('monthReport.in.amount') }}</td>
                </tr>
                <tr v-for="(out, subIndex) in currentItem.out" :key="subIndex">
                  <td class="w-[120px] font-semibold py-0!">{{ out.code }}</td>
                  <td class="py-0!">{{ out.type }}</td>
                  <td class="font-semibold py-0!">{{ out.amount }}</td>
                </tr>
                <tr>
                  <td colspan="2" class="py-0!">
                    <span class="text-primary text-center block font-semibold">{{
                      $t('monthReport.in.out_total')
                    }}</span>
                  </td>
                  <td class="font-semibold py-0!">{{ currentItem.out_total }}</td>
                </tr>
              </tbody>
            </n-table>
            <!-- Qulga tegadigan summa (plastik kartaga o'tkazish, kod 885) -->
            <div
              v-if="currentItem.in_card"
              class="flex items-center justify-between px-3 py-2 mt-4 mb-10 rounded-lg bg-primary/5 border border-primary/20"
            >
              <span class="font-semibold">{{ $t('monthReport.view.net_salary') }}</span>
              <b class="text-primary text-lg tnum">{{ currentItem.in_card.amount }}</b>
            </div>
          </div>
          <template v-if="store.showList.length === 0 && !store.showLoading">
            <p class="text-center pt-10 text-surface/20 text-lg">{{ $t('content.no-data') }}</p>
          </template>
        </n-spin>
      </div>
    </div>
  </div>
</template>
