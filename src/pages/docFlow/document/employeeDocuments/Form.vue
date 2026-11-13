<script setup>
  import { NAvatar } from 'naive-ui'
  import { UISegmentTabs, UISelect, UISignerList } from '@/components/index.js'
  import { useComponentStore, useEmployeeDocumentStore } from '@/store/modules/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'
  import { DOCUMENT_TYPES, documentTypeOptions } from './documentTypes.js'
  import MaterialLiabilityFields from './types/MaterialLiabilityFields.vue'
  import BitimFields from './types/BitimFields.vue'
  import DeclarationFields from './types/DeclarationFields.vue'

  const { t } = i18n.global
  const store = useEmployeeDocumentStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  // Tanlangan turga xos forma bloki.
  const TYPE_FIELDS = {
    'material-liability': MaterialLiabilityFields,
    bitim: BitimFields,
    declaration: DeclarationFields
  }
  const typeDef = computed(() => DOCUMENT_TYPES[store.payload.type])
  const typeOptions = computed(() => documentTypeOptions(t))

  const required = (message) => ({ required: true, trigger: ['blur', 'change'], message })
  const rules = computed(() => ({
    type: required(t('rules.requiredField')),
    worker_position_id: { ...required(t('rules.requiredField')), type: 'number' },
    number: typeDef.value?.numberRequired ? required(t('rules.requiredField')) : undefined,
    document_date: { ...required(t('rules.requiredField')), type: 'number' },
    director_id: { ...required(t('rules.requiredField')), type: 'number' },
    data: Object.fromEntries(
      (typeDef.value?.requiredData ?? []).map((k) => [k, required(t('rules.requiredField'))])
    )
  }))

  const onChangeType = (v) => {
    store.changeType(v)
    formRef.value?.restoreValidation()
  }

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

  // Kelishuvchilar ro'yxatida rahbar bo'lmaydi.
  const approverOptions = computed(() =>
    componentStore.confirmationList.filter((v) => v.id !== store.payload.director_id)
  )
  const toSigner = (v) => ({
    id: v.id,
    data: {
      firstName: v.first_name,
      lastName: v.last_name,
      middleName: v.middle_name,
      photo: v.photo,
      position: v?.position || ''
    }
  })
  // Avval tanlanganlar o'z o'rnida qoladi, yangilari oxiriga qo'shiladi.
  const onChangeApprovers = (ids) => {
    store.payload.confirmations = ids
    const kept = store.sortableConfirmations.filter((v) => ids.includes(v.id))
    const keptIds = kept.map((v) => v.id)
    const added = componentStore.confirmationList
      .filter((v) => ids.includes(v.id) && !keptIds.includes(v.id))
      .map(toSigner)
    store.sortableConfirmations = [...kept, ...added]
  }
  const onSignersUpdate = (items) => {
    store.sortableConfirmations = items
    store.payload.confirmations = items.map((v) => v.id)
  }
  const onChangeDirector = (id) => {
    store.payload.director_id = id
    onChangeApprovers(store.payload.confirmations.filter((v) => v !== id))
  }

  const signMode = computed({
    get: () => (store.oneByOne ? 'sequential' : 'parallel'),
    set: (v) => (store.oneByOne = v === 'sequential')
  })
  const modeTabs = computed(() => [
    { id: 'parallel', name: t('documentPage.command.form.route.parallel') },
    { id: 'sequential', name: t('documentPage.command.form.route.sequential') }
  ])

  const renderPerson = (option) => [
    h('div', { class: 'flex gap-2 my-1 items-center' }, [
      h(NAvatar, {
        src: option.photo || Utils.noAvailableImage,
        'fallback-src': Utils.noAvailableImage
      }),
      h('div', { class: 'flex flex-col' }, [
        h(
          'div',
          { class: 'text-xs font-medium text-textColor1' },
          Utils.shortFio(option.last_name, option.first_name, option.middle_name)
        ),
        h('div', { class: 'text-xs text-textColor3' }, option.position)
      ])
    ])
  ]
  const renderPersonValue = ({ option }) =>
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
    <!-- Balandlik qat'iy: tur almashganda oyna sakramaydi, ichi aylanadi. -->
    <div style="height: calc(100vh - 220px)" class="overflow-y-auto overflow-x-hidden pb-4 pr-1">
      <!-- 1. Hujjat turi -->
      <div class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground mt-2 mb-4">
        <div class="col-span-12">
          <n-form-item :label="$t('employeeDocumentsPage.form.type')" path="type">
            <n-select
              :value="store.payload.type"
              :options="typeOptions"
              label-field="name"
              value-field="id"
              :disabled="Boolean(store.editId)"
              @update:value="onChangeType"
            />
          </n-form-item>
        </div>
      </div>

      <!-- 2. Umumiy qism: korxona, xodim, raqam, sana, rahbar, kelishuvchilar -->
      <div class="grid grid-cols-12 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground mb-4">
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
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t('employeeDocumentsPage.form.number')" path="number">
            <n-input v-model:value="store.payload.number" :maxlength="50" />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t('employeeDocumentsPage.form.date')" path="document_date">
            <n-date-picker
              class="w-full"
              v-model:value="store.payload.document_date"
              type="date"
              :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <div class="col-span-12">
          <n-form-item :label="$t('documentPage.form.director')" path="director_id">
            <n-select
              value-field="id"
              label-field="last_name"
              :value="store.payload.director_id"
              :options="componentStore.confirmationList"
              :loading="componentStore.confirmationLoading"
              :render-label="renderPerson"
              :render-tag="renderPersonValue"
              filterable
              @update:value="onChangeDirector"
            />
          </n-form-item>
        </div>
        <div class="col-span-12">
          <n-form-item :label="$t('documentPage.command.form.confirm')">
            <n-select
              :disabled="!store.payload.director_id"
              value-field="id"
              label-field="last_name"
              multiple
              filterable
              :value="store.payload.confirmations"
              :options="approverOptions"
              :loading="componentStore.confirmationLoading"
              :render-label="renderPerson"
              :render-tag="renderPersonValue"
              :placeholder="$t('employeeDocumentsPage.form.approversHint')"
              @update:value="onChangeApprovers"
            />
          </n-form-item>
        </div>
        <div v-if="store.sortableConfirmations.length" class="col-span-12 flex flex-col gap-2 mb-2">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
            <div class="text-xs text-textColor3 min-w-0 flex-1 basis-[260px] leading-snug">
              {{
                $t(
                  store.oneByOne
                    ? 'documentPage.command.form.route.sequentialHint'
                    : 'documentPage.command.form.route.parallelHint'
                )
              }}
            </div>
            <UISegmentTabs v-model="signMode" :tabs="modeTabs" class="shrink-0" />
          </div>
          <UISignerList
            :items="store.sortableConfirmations"
            :sequential="store.oneByOne"
            :allow-viewers="false"
            @update:items="onSignersUpdate"
          />
        </div>
      </div>

      <!-- 3. Turga xos qism -->
      <div
        v-if="TYPE_FIELDS[store.payload.type]"
        class="grid grid-cols-12 gap-x-4 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground"
      >
        <component :is="TYPE_FIELDS[store.payload.type]" />
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
