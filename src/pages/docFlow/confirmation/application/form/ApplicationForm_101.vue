<script setup>
  import { useComponentStore, useConfApplicationStore } from '@/store/modules/index.js'
  import { UISelect } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useConfApplicationStore()
  const componentStore = useComponentStore()

  const isPosition = computed(() => ![1, 2].includes(store.payload.type))

  const onFocusPosition = () => {
    if (store.myPositionList.length === 0) {
      store._myPositions((list) => {
        if (list.length === 1) {
          store.payload.worker_position_id = list[0].id
          changePosition(list[0].id)
        }
      })
    } else if (store.myPositionList.length === 1 && store.payload.worker_position_id === null) {
      store.payload.worker_position_id = store.myPositionList[0].id
      changePosition(store.payload.worker_position_id)
    }
  }

  // Rahbar va kelishuvchilarni xodim tanlamaydi: rahbar backendda lavozimdan, kelishuvchilarni HR belgilaydi.
  const onSelectApplication = (v) => {
    if (isPosition.value) {
      onFocusPosition()
    } else {
      // 1/2 — yangi ishga kirish: mavjud lavozim yuborilmaydi (backend rad etadi).
      store.payload.worker_position_id = null
    }
  }

  const onChangeStructure = (v) => {
    store.organization_id = v
    store.orgError = false
    if (v.length > 0) store.confirmParams.organization_id = v[0].id
  }

  const changePosition = (id) => {
    let index = store.myPositionList.findIndex((v) => v.id === id)
    if (index !== -1) {
      const org = store.myPositionList[index]?.organization  // org - to'liq object
      store.organization_id = org ? [org] : []
      store.confirmParams.organization_id = org?.id
    }
  }

  onMounted(() => {
    if (componentStore.workerApplicationTypes.length === 0) {
      componentStore._workerApplicationEnums()
    }
    if (componentStore.allStructureList.length === 0) {
      componentStore._allStructures()
    }
  })
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.type`)" path="type">
        <n-select
          v-model:value="store.payload.type"
          filterable
          :options="componentStore.workerApplicationTypes"
          label-field="name"
          value-field="id"
          :loading="componentStore.workerApplicationLoading"
          @update:value="onSelectApplication"
        />
      </n-form-item>
    </div>
    <div class="col-span-12" v-if="isPosition && store.payload.type">
      <n-form-item :label="$t(`applicationPage.form.worker_position_id`)" path="worker_position_id">
        <n-select
          @focus="onFocusPosition"
          v-model:value="store.payload.worker_position_id"
          :options="store.myPositionList"
          :loading="store.positionLoading"
          :render-label="UIHelper.selectRender.label"
          :render-tag="UIHelper.selectRender.value"
          @update:value="changePosition"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>
    <div class="col-span-12 pr-3" v-if="!isPosition">
      <n-form-item
        :label="$t(`documentPage.form.organization`)"
        :show-require-mark="true"
        :validation-status="store.orgError ? 'error' : undefined"
        :feedback="store.orgError ? $t('rules.requiredField') : undefined"
      >
        <UISelect
          :options="componentStore.allStructureList"
          :model-v="store.organization_id"
          @defaultValue="(v) => (store.organization_id = v)"
          @updateModel="onChangeStructure"
          :checked-val="store.structureCheck"
          @updateCheck="(v) => (store.structureCheck = v)"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._allStructures"
          :loading="componentStore.allStructureLoading"
          :multiple="false"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.application_date`)" path="application_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.application_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
  </div>
</template>
