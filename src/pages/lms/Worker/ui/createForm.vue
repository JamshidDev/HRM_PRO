<script setup>
import { UINSelect, UISelect } from '@/components/index.js'
import validationRules from '@/utils/validationRules.js'
import { useLmsWorkerStore, useComponentStore } from '@/store/modules/index.js'
import UIHelper from '@/utils/UIHelper.js'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

const formRef = ref(null)
const workerItemRef = ref(null)
const store = useLmsWorkerStore()
const componentStore = useComponentStore()

// "Barchasini tanlash" qiymatni programmatik o'rnatadi va ichki n-select
// form validatsiyasini trigger qilmaydi — shu sabab tanlangach ham "majburiy"
// xatosi qolib ketadi. Tanlov bo'lganda maydonni qo'lda qayta validatsiya qilamiz.
watch(
  () => store.payload.worker_position_ids,
  (val) => {
    if (val?.length) {
      workerItemRef.value?.validate({ trigger: 'change' }).catch(() => { })
    }
  }
)

const onSubmit = () => {
  // Backend limitdan oshsa HTTP 200 + `error:false` qaytaradi va hech narsa
  // biriktirmaydi — foydalanuvchi buni «muvaffaqiyat» deb ko'rardi. Shuning
  // uchun so'rov yuborilishidan OLDIN to'xtatamiz.
  if (store.isOverEduPlanLimit) {
    $Toast.error(
      t('lmsWorkerPage.form.planLimitExceeded', {
        limit: store.eduPlanLimit,
        n: store.payload.worker_position_ids.length
      })
    )
    return
  }
  formRef.value?.validate((error) => {
    if (!error) {
      store.saveLoading = true
      const data = {
        ...store.payload,
        organizations: undefined
      }
      store._create(data)
    }
  })
}

const onChange = () => {
  store.payload.worker_position_ids = []
  store.workerParams.page = 1
  if (!store.payload.edu_plan_id) return
  store._workers()
}

const onSearch = (v) => {
  store.workerParams.search = v
  store.workerParams.page = 1
  store._workers()
}

const onChangeOrg = (v) => {
  store.payload.organizations = v
  store.payload.worker_position_ids = []
  store.workerParams.page = 1
  if (!store.payload.organizations.length === 0) return
  store._workers()
}

// Scroll eng pastga yetganda keyingi 200 tani ALOHIDA so'rov bilan yuklaydi
const onScrollWorkers = () => {
  store.workerParams.page += 1
  store._workers(true)
}

onMounted(() => {
  if (store.eduPlanList.length === 0) {
    store._eduPlans()
  }
  if (componentStore.structureList.length === 0) {
    componentStore._structures()
  }
})
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <div style="min-height: calc(100vh - 120px)">
      <n-form-item :label="$t(`lmsWorkerPage.form.eduPlan`)" path="edu_plan_id" rule-path="requiredNumberField">
        <n-select v-model:value="store.payload.edu_plan_id" :options="store.eduPlanList" :loading="store.eduPlanLoading"
          label-field="name" value-field="id" filterable clearable :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value" @update:value="onChange" />
      </n-form-item>
      <n-form-item :label="$t(`content.organization`)" path="edu_plan_id" rule-path="requiredNumberField">
        <UISelect :options="componentStore.structureList" :model-v="store.payload.organizations"
          @defaultValue="(v) => (store.payload.organizations = v)" @updateModel="onChangeOrg"
          :checked-val="store.structureCheck" @updateCheck="(v) => (store.structureCheck = v)"
          :loading="componentStore.structureLoading" v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures" />
      </n-form-item>
      <n-form-item ref="workerItemRef" :label="$t(`lmsWorkerPage.form.worker_position_ids`)" path="worker_position_ids"
        rule-path="requiredMultiSelectField">
        <div class="w-full">
          <UINSelect :disabled="!store.payload.edu_plan_id || store.payload.organizations.length === 0" :multiple="true"
            :query="store.workerParams.search" v-model:value="store.payload.worker_position_ids" :value-field="'id'"
            :options="store.workerList" :loading="store.workerLoading" :total-count="store.totalWorker"
            @onSearch="onSearch" @onScrollEv="onScrollWorkers" />
          <!-- Sig'im reja tanlangach ko'rinadi: limitdan oshsa so'rov yuborilmaydi. -->
          <div v-if="store.eduPlanLimit" class="mt-1 text-xs flex gap-2">
            <span class="text-secondary">
              {{ $t('lmsWorkerPage.form.planLimit', { limit: store.eduPlanLimit }) }}
            </span>
            <span :class="store.isOverEduPlanLimit ? 'text-red-500 font-medium' : 'text-secondary'">
              {{ $t('lmsWorkerPage.form.planSelected', { n: store.payload.worker_position_ids.length }) }}
            </span>
          </div>
        </div>
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :disabled="store.isOverEduPlanLimit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
