<script setup>
  import { useAccountStore, useScheduleGroupWorkerStore } from '@/store/modules/index.js'
  import { UIModal, UINSelect } from '@/components/index.js'
  import validationRules from '@/utils/validationRules.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import i18n from '@/i18n/index.js'
  import { findSwapConflicts } from './conflicts.js'
  import { showAlert } from '@/components/notify/alertDialog.js'

  const store = useScheduleGroupWorkerStore()
  const accStore = useAccountStore()
  const formRef = ref(null)
  const { t } = i18n.global

  const partnerGroupAt = (w, date) =>
    w.ranges?.find((r) => r.date_from <= date && date <= r.date_to)?.group_id || undefined

  const onSubmit = () => {
    if (!accStore.checkAction(accStore.pn.turnstileSheetsGroupsWrite)) return
    formRef.value?.validate((error) => {
      if (!error) {
        const newWorker = store.workerList.find(
          (v) => v.positionId === store.replacePayload.positonId
        )
        const data = {
          group_1: store.params.group,
          worker_1: store.selectedWorker.workerId,
          worker_position_1: store.selectedWorker.workerPositionId,

          worker_2: newWorker.id,
          worker_position_2: newWorker.positionId,
          // Sherikning o'sha sanadagi grafigi (eski/o'chirilgan bog'lanish emas).
          group_2: partnerGroupAt(newWorker, Utils.timeToZone(store.replacePayload.date)),
          status: store.replacePayload.status,
          date: Utils.timeToZone(store.replacePayload.date)
        }
        // Guruhda soat kesishsa — ogohlantirish; foydalanuvchi tasdiqlasa saqlanadi.
        const conflicts = findSwapConflicts({
          list: store.list,
          crewMap: store.crewMap,
          a: data.worker_position_1,
          b: data.worker_position_2,
          from: data.date,
          to: data.status ? data.date : store.monthRange.to
        })
        if (!conflicts.length) return store._replaceWorker(data)
        // Ovozli 3D ogohlantirish (AlertDialog) — tasdiqlansa saqlanadi.
        showAlert({
          type: 'warning',
          title: t('shiftType.groupView.conflictTitle'),
          message: t('shiftType.groupView.conflictHint'),
          listHint: '',
          errors: [
            ...new Set(
              conflicts.map(
                (c) =>
                  `${c.title}: ${c.first.name} (${c.first.start}–${c.first.end}) ⟷ ${c.second.name} (${c.second.start}–${c.second.end})`
              )
            )
          ],
          confirmText: t('shiftType.groupView.conflictSave'),
          onConfirm: () => store._replaceWorker(data)
        })
      }
    })
  }

  // Bir kunlik almashishda xodimning o'sha kuni dam bo'lsa — ogohlantirish.
  // Faqat ma'nosiz holatda: sherik grafiksiz yoki uning ham shu kuni dami.
  const isRestDay = computed(() => {
    if (store.replacePayload.status !== true || !store.replacePayload.positonId) return false
    const date = Utils.timeToZone(store.replacePayload.date)
    const day = store.selectedWorker?.days?.find((d) => d.date === date)
    if (!day || day.isEmpty || day.isWorkDay || day.sub) return false
    const partner = store.workerList.find((v) => v.positionId === store.replacePayload.positonId)
    if (!partner?.ranges?.length) return true
    const row = store.list.find((v) => v.worker_position_id === partner.positionId)
    const pd = row?.days?.find((d) => d.date === date)
    return !!pd && pd.id !== null && !Number(pd.work_status)
  })

  // Sana faqat tanlangan oy ichida.
  const disabledDate = (ts) => {
    const d = Utils.timeToZone(ts)
    return d < store.monthRange.from || d > store.monthRange.to
  }

  const onSearch = (v) => {
    store.workerParams.search = v
    store._workers()
  }
</script>

<template>
  <UIModal
    v-model:visible="store.replaceVisible"
    :width="500"
    :title="$t('shiftType.form.replaceWorker')"
  >
    <n-form
      class="grid grid-cols-12"
      ref="formRef"
      :rules="validationRules.common"
      :model="store.replacePayload"
    >
      <div
        class="col-span-12 border border-surface-line px-4 py-2 mb-6 rounded-xl bg-surface-ground/40"
      >
        <div class="line-clamp-1 leading-[1.2] font-semibold">
          {{ store.selectedWorker.fullName }}
        </div>
        <div class="line-clamp-1 leading-[1.2] text-secondary">
          {{ store.selectedWorker.position }}
        </div>
      </div>
      <n-form-item
        class="col-span-12"
        :label="$t('shiftType.groupView.swapWith')"
        path="positonId"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <UINSelect
          @onSearch="onSearch"
          :query="store.workerParams.search"
          :options="store.workerList"
          v-model:value="store.replacePayload.positonId"
          value-field="positionId"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          :loading="store.workerLoading"
          :total-count="store.totalWorker"
          @onScrollEv="store._workers(true)"
        />
      </n-form-item>
      <n-form-item
        class="col-span-12"
        :label="$t('shiftType.groupView.swapFrom')"
        path="date"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-date-picker
          clearable
          v-model:value="store.replacePayload.date"
          type="date"
          class="w-full"
          :is-date-disabled="disabledDate"
        />
      </n-form-item>
      <n-radio-group
        v-model:value="store.replacePayload.status"
        class="col-span-12 grid! grid-cols-2 gap-2 mb-6"
      >
        <n-radio :value="true" class="border px-2 py-1 border-surface-line rounded-lg">
          {{ $t('shiftType.groupView.swapOneDay') }}
        </n-radio>
        <n-radio :value="false" class="border px-2 py-1 border-surface-line rounded-lg">
          {{ $t('shiftType.groupView.swapToMonthEnd') }}
        </n-radio>
      </n-radio-group>
      <n-alert v-if="isRestDay" type="warning" class="col-span-12 mb-4">
        {{ $t('shiftType.groupView.restDayWarn') }}
      </n-alert>
      <div class="col-span-12 flex justify-end gap-4">
        <n-button @click="store.replaceVisible = false" type="error" secondary>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSubmit" :loading="store.replaceLoading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
