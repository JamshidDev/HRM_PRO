<script setup>
import { useLmsCertificateStore } from "@stores"
import {useAppSetting, validationRules} from "@utils"
import {UIModal, UIUser} from "@components"
import {ArrowSyncCircle20Regular} from "@vicons/fluent"
import UIHelper from "@utils/UIHelper.js"
import {Utils} from "@utils"
import i18n from "@/i18n/index.js"

const store = useLmsCertificateStore()
const formRef = ref(null)
const t = i18n.global.t



const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      const workerData = store.payload.workers.filter(filterCallback)
          .map(v=> ({
            id: v.id,
            worker_id:v.workerId,
            worker_position_id:v.workerPositionId,

            start_exam_id: v.showStartInput? undefined : v.start_exam_id,
            end_exam_id: v.showEndInput? undefined : v.end_exam_id,

            start_exam_result: v.showStartInput? v.start_exam_result : undefined,
            end_exam_result: v.showEndInput? v.end_exam_result : undefined,
          }))

      if(!workerData?.length) return

      const data = {
        group_id:store.payload.group_id,
        protocol_id:store.payload.protocol_id===0? undefined : store.payload.protocol_id,
        protocol_date: Utils.timeToZone(store.payload.protocol_date),
        cert_from: Utils.timeToZone(store.payload.cert_from),
        cert_to: Utils.timeToZone(store.payload.cert_to),
        workers: workerData,
      }

      store._create(data)
    }
  })
}

const filterCallback = (w)=>{
  const end = w.showEndInput ? w?.end_exam_result : w.end_exam_id
  const start = w.showStartInput ? w?.start_exam_result : w.start_exam_id
  return end && start
}

const customFormat = (val) => /^(0|[1-9]\d?)?(\/(([1-9]\d?)?)?)?$/.test(val)

const onToggleInput = (idx, type)=>{
  const key = type === 'start' ? 'showStartInput' : 'showEndInput'
  store.payload.workers[idx][key] = !store.payload.workers[idx][key]
  if(store.payload.workers[idx][key]) return
  store._workerExam(idx, type === 'start')
}

const validateExam = (index, field) => {
  const worker = store.payload.workers?.[index]
  if (worker[field] && !/^\d{1,2}\/\d{1,2}$/.test(worker[field])) {
    worker[field] = null
    $Toast.warning(t('lmsCertificate.warning.invalidResult'))
  }
}

const onDateChange = (date) => {
  if(!date) return
  const nextDate = new Date(date)
  nextDate.setFullYear(nextDate.getFullYear() + 3)
  store.payload.cert_to = nextDate.getTime()

}

</script>

<template>
  <UIModal
      :width="'90%'"
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="$t('lmsCertificate.createTitle')"
  >
    <template #default>
      <n-form ref="formRef" class="grid grid-cols-12 gap-x-4" :rules="validationRules.common" :model="store.payload">
        <n-form-item
            class="col-span-4"
            :label="$t(`lmsCertificate.form.protocol_date`)"
            path="protocol_date"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-date-picker
              class="w-full"
              v-model:value="store.payload.protocol_date"
              type="date"
              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`lmsCertificate.form.cert_from`)"
            path="protocol_date"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-date-picker
              class="w-full"
              v-model:value="store.payload.cert_from"
              type="date"
              :format="useAppSetting.datePicketFormat"
              @update:value="onDateChange"
          />
        </n-form-item>
        <n-form-item
            class="col-span-4"
            :label="$t(`lmsCertificate.form.cert_to`)"
            path="cert_to"
            :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-date-picker
              class="w-full"
              v-model:value="store.payload.cert_to"
              type="date"
              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
        <n-spin :show="store.workerLoading" class="col-span-12">
          <div class="border border-surface-line h-[calc(100vh-260px)] mb-6 rounded-xl overflow-y-auto relative">
            <div class="col-span-12 bg-surface-section grid grid-cols-12 gap-x-6 sticky top-0 z-10 mb-2 border-b border-surface-line">
              <div class="col-span-4 px-2 py-1 font-medium">{{$t('content.worker')}}</div>
              <div class="col-span-4 px-2 py-1 font-medium">{{$t('lmsCertificate.form.start_exam_result')}}</div>
              <div class="col-span-4 px-2 py-1 font-medium">{{$t('lmsCertificate.form.end_exam_result')}}</div>
            </div>
                <template v-for="(worker, idx) of store.payload.workers" :key="worker.id">
                  <div class="mx-2 grid grid-cols-12 items-center gap-x-4 mb-2 bg-surface-ground/60 py-1 px-2 rounded-xl border border-surface-line">
                    <div class="col-span-4">
                        <UIUser :hide-tooltip="true" :short="false" :data="worker.data" />
                    </div>
                    <div class="col-span-4">
                      <n-input-group>
                        <n-input
                            v-if="worker.showStartInput"
                            class="w-full"
                            type="text"
                            v-model:value="worker.start_exam_result"
                            :allow-input="customFormat"
                            @blur="validateExam(idx, 'start_exam_result')"
                            placeholder="##/##"
                        />
                        <n-select
                            v-else
                            v-model:value="worker.start_exam_id"
                            :options="worker.startOption"
                            label-field="name"
                            value-field="id"
                            :render-label="UIHelper.selectRender.label"
                            :render-tag="UIHelper.selectRender.value"
                            filterable
                            clearable
                        />
                        <n-button type="primary" @click="onToggleInput(idx, 'start')">
                         <template #icon>
                           <n-icon :size="26">
                             <ArrowSyncCircle20Regular size="20"/>
                           </n-icon>
                         </template>
                        </n-button>
                      </n-input-group>

                    </div>
                    <div class="col-span-4">
                      <n-input-group>
                        <n-input
                            v-if="worker.showEndInput"
                            class="w-full"
                            type="text"
                            v-model:value="worker.end_exam_result"
                            :allow-input="customFormat"
                            @blur="validateExam(idx, 'end_exam_result')"
                            placeholder="##/##"
                        />
                        <n-select
                            v-else
                            v-model:value="worker.end_exam_id"
                            :options="worker.endOption"
                            label-field="name"
                            value-field="id"
                            :render-label="UIHelper.selectRender.label"
                            :render-tag="UIHelper.selectRender.value"
                            filterable
                            clearable
                        />
                        <n-button type="primary" @click="onToggleInput(idx, 'end')">
                          <template #icon>
                            <n-icon :size="26">
                              <ArrowSyncCircle20Regular size="20"/>
                            </n-icon>
                          </template>
                        </n-button>
                      </n-input-group>
                    </div>
                  </div>
                </template>
          </div>
        </n-spin>

        <div class="col-span-12 grid grid-cols-2 gap-2">
          <n-button @click="store.visible = false" type="error" ghost>
            {{ $t('content.cancel') }}
          </n-button>
          <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
            {{ $t('content.save') }}
          </n-button>
        </div>
      </n-form>
    </template>
  </UIModal>
</template>