<script setup>
  import { Utils, validationRules } from '@utils'
  import { useComponentStore, useScheduleTableStore } from '@stores'
  import { SuperSelect, UIModal, UISelect } from '@components'
  import { ArrowCircleDown24Regular } from '@vicons/fluent'

  const store = useScheduleTableStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)
  const uploadBtn = ref()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return

      const data = {
        ...store.export.payload,
        organization_id: store.export.payload.organization_id?.[0]?.id || undefined,
        departments: store.export.payload.departments.toString() || undefined
      }
      store._exportTable(data)
      uploadBtn.value?.$el?._triggerFly?.()
    })
  }

  const changeOrg = (v) => {
    store.export.payload.organization_id = v
    store.export.payload.departments = []
    store.department.list = []
    if (!v?.length) return
    store._fetchDepartment()
  }

  const fetchOrganization = () => {
    if (!componentStore.organizationList?.length) return
    componentStore._structures()
  }

  const onDefaultEv = (v) => {
    store.export.payload.organization_id = v
    store.export.payload.departments = []
    store.department.list = []
    store._fetchDepartment()
  }

  const onSearchDepartment = (v) => {
    store.department.params.page = 1
    store.department.params.search = v
    store._fetchDepartment()
  }

  const onScrollDepartment = () => {
    store.department.params.page += 1
    store._fetchDepartment(true)
  }

  onMounted(() => {
    fetchOrganization()
  })
</script>

<template>
  <UIModal :width="520" v-model:visible="store.export.visible" :title="$t('content.export')">
    <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.export.payload"
      class="grid grid-cols-12 gap-x-4 pt-4"
    >
      <n-form-item
        class="col-span-12"
        :label="$t(`content.organization`)"
        path="organization_id"
        :rule-path="validationRules.rulesNames.requiredMultiSelectField"
      >
        <UISelect
          :options="componentStore.structureList"
          :modelV="store.export.payload.organization_id"
          @defaultValue="onDefaultEv"
          @updateModel="changeOrg"
          :checkedVal="store.export.cache"
          @updateCheck="(v) => (store.export.cache = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :multiple="false"
        />
      </n-form-item>
      <n-form-item class="col-span-12" :label="$t(`content.department`)" path="departments">
        <SuperSelect
          :max-tag-count="1"
          :options="store.department.list"
          :loading="store.department.loading"
          :total-count="store.department.total"
          :per-page="store.department.params.per_page"
          v-model:value="store.export.payload.departments"
          v-model:search="store.department.params.search"
          value-field="id"
          @onSearch="onSearchDepartment"
          @onScrollEv="onScrollDepartment"
          :multiple="true"
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`content.year`)" path="year">
        <n-select
          :options="Utils.yearList"
          v-model:value="store.export.payload.year"
          value-field="id"
          label-field="name"
        />
      </n-form-item>
      <n-form-item class="col-span-6" :label="$t(`content.month`)" path="month">
        <n-select
          :options="Utils.monthList"
          v-model:value="store.export.payload.month"
          value-field="id"
          label-field="name"
        />
      </n-form-item>
      <n-button
        ref="uploadBtn"
        v-fly-upload.manual
        @click="onSubmit"
        type="primary"
        :loading="store.export.loading"
        class="col-span-12"
      >
        <template #icon>
          <ArrowCircleDown24Regular />
        </template>
        {{ $t('content.download') }}
      </n-button>
    </n-form>
  </UIModal>
</template>
