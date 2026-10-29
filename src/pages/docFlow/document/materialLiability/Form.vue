<script setup>
  import { NAvatar } from 'naive-ui'
  import { UISelect } from '@/components/index.js'
  import { useComponentStore, useMaterialLiabilityStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const store = useMaterialLiabilityStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const required = (message) => ({ required: true, trigger: ['blur', 'change'], message })
  const rules = computed(() => ({
    worker_position_id: { ...required(t('rules.requiredField')), type: 'number' },
    number: required(t('rules.requiredField')),
    contract_date: { ...required(t('rules.requiredField')), type: 'number' },
    director_id: { ...required(t('rules.requiredField')), type: 'number' },
    assets: required(t('rules.requiredField'))
  }))

  const onChangeOrganization = (v) => {
    // Tahrirda xodim (va korxona) o'zgarmaydi.
    if (store.editId) return
    store.organization = v
    componentStore.workerList = []
    store.payload.worker_position_id = null
    componentStore.workerParams.organization_id = v.length > 0 ? v[0].id : null
  }

  const onOpenWorker = (v) => {
    if (!v || store.editId) return
    componentStore.onOpenWorkerEv(v)
  }

  const renderDirector = (option) => [
    h('div', { class: 'flex gap-2 my-1 items-center' }, [
      h(NAvatar, {
        src: option.photo || Utils.noAvailableImage,
        'fallback-src': Utils.noAvailableImage
      }),
      h('div', { class: 'flex flex-col' }, [
        h(
          'div',
          { class: 'text-xs font-medium text-textColor1' },
          `${option.last_name} ${option.first_name?.[0] ?? ''}.${option.middle_name?.[0] ?? ''}.`
        ),
        h('div', { class: 'text-xs text-textColor3' }, option.position)
      ])
    ])
  ]
  const renderDirectorValue = ({ option }) =>
    h('div', { class: 'flex gap-2 my-1 items-center' }, `${option?.last_name} ${option?.first_name} ${option?.middle_name}`)

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      if (store.editId) return store._submitEdit()
      store._create()
    })
  }

  onMounted(() => {
    if (componentStore.structureList.length === 0) componentStore._structures()
    if (componentStore.confirmationList.length === 0) componentStore._confirmations()
  })
</script>

<template>
  <n-form ref="formRef" :rules="rules" :model="store.payload">
    <div style="max-height: calc(100vh - 180px)" class="overflow-y-auto overflow-x-hidden pb-4">
      <div
        class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground mt-2 mb-4"
      >
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t('documentPage.form.organization')">
            <UISelect
              :options="componentStore.structureList"
              :model-v="store.organization"
              @updateModel="onChangeOrganization"
              :checked-val="store.structureCheck"
              @updateCheck="(v) => (store.structureCheck = v)"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._structures"
              :loading="componentStore.structureLoading"
              :multiple="false"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t('documentPage.form.worker')" path="worker_position_id">
            <n-select
              :disabled="store.organization.length === 0 || Boolean(store.editId)"
              v-model:value="store.payload.worker_position_id"
              filterable
              :options="componentStore.workerList"
              label-field="name"
              value-field="id"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
              :loading="componentStore.workerLoading"
              @scroll="componentStore.onScrollWorker"
              @search="componentStore.onSearchWorker"
              @update:show="onOpenWorker"
            />
          </n-form-item>
        </div>
      </div>

      <div
        class="grid grid-cols-12 gap-x-4 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground"
      >
        <div class="col-span-12 md:col-span-4">
          <n-form-item :label="$t('documentPage.form.contractNumber')" path="number">
            <n-input v-model:value="store.payload.number" :maxlength="50" />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-4">
          <n-form-item :label="$t('documentPage.form.contractDate')" path="contract_date">
            <n-date-picker
              class="w-full"
              v-model:value="store.payload.contract_date"
              type="date"
              :format="useAppSetting.datePicketFormat"
              :disabled="Boolean(store.editId)"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-4">
          <n-form-item :label="$t('documentPage.form.director')" path="director_id">
            <n-select
              value-field="id"
              label-field="last_name"
              v-model:value="store.payload.director_id"
              :options="componentStore.confirmationList"
              :loading="componentStore.confirmationLoading"
              :render-label="renderDirector"
              :render-tag="renderDirectorValue"
              filterable
            />
          </n-form-item>
        </div>
        <div class="col-span-12">
          <n-form-item :label="$t('materialLiabilityPage.form.assets')" path="assets">
            <n-input
              v-model:value="store.payload.assets"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 8 }"
              :maxlength="5000"
              :placeholder="$t('materialLiabilityPage.form.assetsPlaceholder')"
            />
          </n-form-item>
        </div>
        <div class="col-span-12">
          <n-form-item :label="$t('materialLiabilityPage.form.workDescription')">
            <n-input
              v-model:value="store.payload.work_description"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 5 }"
              :maxlength="2000"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t('materialLiabilityPage.form.workerObligations')">
            <n-input
              v-model:value="store.payload.worker_obligations"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 6 }"
              :maxlength="5000"
              :placeholder="$t('materialLiabilityPage.form.optionalHint')"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t('materialLiabilityPage.form.employerObligations')">
            <n-input
              v-model:value="store.payload.employer_obligations"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 6 }"
              :maxlength="5000"
              :placeholder="$t('materialLiabilityPage.form.optionalHint')"
            />
          </n-form-item>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2 mt-3">
      <n-button @click="store.visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
