<script setup>
  import { selectWrap } from '@/utils/selectWrap.js'
  import { useComponentStore, useConfApplicationStore } from '@/store/modules/index.js'
  import { UIDayPicker, UISelect } from '@/components/index.js'
  import UIHelper from '@/utils/UIHelper.js'

  const store = useConfApplicationStore()
  const componentStore = useComponentStore()

  const isPosition = computed(() => !store.isOrgPlace())

  // Tavsif bo'lsa — turlar guruhlab (5 guruh), aks holda eski tekis ro'yxat.
  // Bildirgilar menyusida — faqat xodim bildirgilari, Arizalarda — ular chiqmaydi.
  const typeOptions = computed(() => {
    const schema = componentStore.workerApplicationSchema
    const types = componentStore.workerApplicationTypes.filter((v) => !!v.notice === store.noticeMode)
    if (!schema) return types
    return schema.groups
      .map((g) => ({
        type: 'group',
        key: `g${g.id}`,
        name: g.name,
        children: types.filter((v) => v.group === g.id)
      }))
      .filter((g) => g.children.length)
  })

  // Lavozim doim tanlangan turadi: backend asosiy lavozimni birinchi beradi (bitta yoki bir nechta bo'lsa ham).
  const selectMainPosition = () => {
    if (store.payload.worker_position_id !== null || !store.myPositionList.length) return
    store.payload.worker_position_id = store.myPositionList[0].id
    changePosition(store.payload.worker_position_id)
  }
  const onFocusPosition = () => {
    if (store.myPositionList.length === 0) store._myPositions(selectMainPosition)
    else selectMainPosition()
  }

  // Rahbar va kelishuvchilarni xodim tanlamaydi: rahbar backendda lavozimdan, kelishuvchilarni HR belgilaydi.
  const onSelectApplication = () => {
    store.resetPlace()
    store.payload.data = {}
    onFocusPosition()
  }

  const onChangeStructure = (v) => {
    if (v?.[0]?.id !== store.confirmParams.organization_id) store.resetPlace()
    store.organization_id = v
    store.orgError = false
    if (v.length > 0) store.confirmParams.organization_id = v[0].id
  }

  const changePosition = (id) => {
    // 1/2 — korxona alohida tanlanadi, lavozim uni o'zgartirmaydi.
    if (store.isOrgPlace()) return
    let index = store.myPositionList.findIndex((v) => v.id === id)
    if (index !== -1) {
      const org = store.myPositionList[index]?.organization  // org - to'liq object
      if (org?.id !== store.confirmParams.organization_id) store.resetPlace()
      store.organization_id = org ? [org] : []
      store.confirmParams.organization_id = org?.id
    }
  }

  // Forma har ochilganda lavozim qayta tanlanadi (har qanday ariza turida).
  watch(
    () => store.visible,
    (visible) => visible && onFocusPosition(),
    { immediate: true }
  )

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
      <n-form-item :label="$t(store.noticeMode ? 'noticesPage.type' : `applicationPage.form.type`)" path="type">
        <n-select
          v-bind="selectWrap"
          v-model:value="store.payload.type"
          filterable
          :options="typeOptions"
          label-field="name"
          value-field="id"
          :loading="componentStore.workerApplicationLoading"
          @update:value="onSelectApplication"
        />
      </n-form-item>
    </div>
    <!-- Lavozim har qanday turda, ariza turidan keyin; 1/2 da ixtiyoriy. -->
    <div class="col-span-12">
      <n-form-item
        :label="$t(`applicationPage.form.worker_position_id`)"
        path="worker_position_id"
        :show-require-mark="isPosition"
      >
        <n-select
          v-bind="selectWrap"
          @focus="onFocusPosition"
          v-model:value="store.payload.worker_position_id"
          :fallback-option="(v) => ({ id: v, name: '' })"
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
    <!-- Sana doim bir joyda (tur tanlanganda siljimaydi). -->
    <div class="col-span-12">
      <n-form-item :label="$t(store.noticeMode ? 'noticesPage.date' : `applicationPage.form.application_date`)" path="application_date">
        <UIDayPicker
          class="w-full"
          v-model:value="store.payload.application_date"
          mode="day"
        />
      </n-form-item>
    </div>
    <!-- 1/2: korxona sanadan keyin, alohida qatorda. -->
    <div class="col-span-12" v-if="!isPosition">
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
          @onSubmit="componentStore._allStructures"
          :loading="componentStore.allStructureLoading"
          :multiple="false"
        />
      </n-form-item>
    </div>
  </div>
</template>
