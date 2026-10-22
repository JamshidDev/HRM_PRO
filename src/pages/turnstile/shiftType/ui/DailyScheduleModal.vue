<script setup>
  import { DismissCircle24Filled, Clock12Regular, PersonQuestionMark20Regular } from '@vicons/fluent'
  import { useDialog } from 'naive-ui'
  import { useAccountStore, useShiftTypeStore } from '@stores'
  import { UIModal, UIUser, UIPagination } from '@components'
  import DailyScheduleFilter from './DailyScheduleFilter.vue'
  import i18n from '@/i18n/index.js'

  const store = useShiftTypeStore()
  const accStore = useAccountStore()
  const dialog = useDialog()
  const t = i18n.global.t

  // Mavjud guruhga xodim biriktirish (har kunlik smena) — sarlavhada guruh nomi.
  const title = computed(() => {
    const name = store.groupList.find((g) => g.id === store.groupId)?.name
    return name ? t('shiftType.groupView.attachTitle', { name }) : t('shiftType.form.groupWorkers')
  })

  const changePage = (v) => {
    store.notScheduleParams.page = v.page
    store.notScheduleParams.per_page = v.per_page
    store._notScheduleWorker()
  }

  const save = () => {
    const data = {
      group_id: store.groupId || undefined,
      schedule_type: store.elementId,
      start_date: store.notScheduleParams.start_date,
      end_date: store.notScheduleParams.end_date,
      worker_position_ids: store.selectedWorkers
    }
    store._generateWorkerSchedule(data)
  }

  const onSave = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsWorkersWrite)) return
    if (store.selectedWorkers.length === 0) {
      $Alert.validation(t('shiftType.generate.noWorkerSelected'))
      return
    }
    // Boshqa smenasi bor xodimlar ko'chiriladi — aylanma smenadagi kabi avval so'raymiz.
    const moved = store.selectedWorkers.filter((id) => store.busyWorkerIds.includes(id)).length
    if (!moved) return save()
    dialog.warning({
      title: t('shiftType.generate.moveTitle'),
      content: t('shiftType.generate.moveConfirm', { n: moved }),
      positiveText: t('content.yes'),
      negativeText: t('content.no'),
      onPositiveClick: save
    })
  }

  const onForceUnSelect = () => {
    store.selectedWorkers = []
  }
</script>

<template>
  <UIModal v-model:visible="store.notScheduleVisible" :width="'90%'" :title="title">
    <div>
      <n-spin :show="store.notScheduleLoading">
        <DailyScheduleFilter />
        <div class="w-full overflow-y-auto h-[min(600px,55vh)] pr-2 mt-4">
          <n-checkbox-group v-if="store.notScheduleWorkerList.length > 0" v-model:value="store.selectedWorkers">
            <n-table :single-line="false" size="small" class="sticky-table-header">
              <thead>
                <tr>
                  <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
                  <th class="min-w-[40px] w-[40px]"></th>
                  <th class="min-w-[100px]">{{ $t('content.fullName') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in store.notScheduleWorkerList" :key="item.id">
                  <td>
                    <span class="text-center block">{{
                      (store.notScheduleParams.page - 1) * store.notScheduleParams.per_page + idx + 1
                    }}</span>
                  </td>
                  <td>
                    <div class="flex justify-center">
                      <n-checkbox size="large" :value="item.id" />
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center justify-between gap-3">
                      <UIUser :hide-tooltip="true" :short="false" class="min-w-0 flex-1" :data="item.data" />
                      <!-- Shu davrda boshqa smenasi bor — saqlansa shu guruhga ko'chiriladi -->
                      <span
                        v-if="item.shifts?.length"
                        class="shrink-0 inline-flex max-w-[45%] items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] leading-none bg-fig-chip-amber text-fig-chip-amber-text"
                        :title="item.shifts.join(', ')"
                      >
                        <n-icon size="12" class="shrink-0"><Clock12Regular /></n-icon>
                        <span class="truncate">{{ item.shifts.join(', ') }}</span>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </n-checkbox-group>
          <div
            v-else-if="!store.notScheduleLoading"
            class="h-full flex flex-col items-center justify-center gap-2 text-secondary text-sm"
          >
            <n-icon size="36"><PersonQuestionMark20Regular /></n-icon>
            {{ $t('shiftType.generate.workersNotFound') }}
          </div>
        </div>
        <UIPagination
          :page="store.notScheduleParams.page"
          :per_page="store.notScheduleParams.per_page"
          :total="store.notScheduleWorkerCount"
          @change-page="changePage"
        />
        <div class="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div class="flex items-center gap-2">
            <!-- Faqat ko'rsatkich (bosiladigan tugma emas) -->
            <span class="inline-flex items-center gap-1.5 px-3 h-[34px] rounded-lg bg-primary/10 text-primary text-sm">
              {{ $t('content.selected') }}
              <span class="font-bold">{{ store.selectedWorkers.length }}</span>
            </span>
            <n-button
              v-if="store.selectedWorkers.length"
              secondary
              type="error"
              @click="onForceUnSelect"
            >
              <template #icon>
                <DismissCircle24Filled />
              </template>
              {{ $t('content.forceUnSelectAll') }}
            </n-button>
          </div>

          <div class="flex gap-3">
            <n-button secondary @click="store.notScheduleVisible = false">{{ $t('content.cancel') }}</n-button>
            <n-button :loading="store.saveLoading" type="primary" @click="onSave">
              {{
                $t('content.save')
              }}
            </n-button>
          </div>
        </div>
      </n-spin>
    </div>
  </UIModal>
</template>
