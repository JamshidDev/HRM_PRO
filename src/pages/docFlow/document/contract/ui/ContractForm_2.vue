<script setup>
  import Utils from '@/utils/Utils.js'
  import { UISelect, UIFigBlock, UIFigField } from '@/components/index.js'
  import UIDepartment from '@/components/ui/UIDepartment.vue'
  import { useComponentStore, useContractStore } from '@/store/modules/index.js'
  import UIHelper from '@utils/UIHelper.js'
  import icons from '@/assets/icons'

  const store = useContractStore()
  const componentStore = useComponentStore()

  const onChangeDepartment = (v) => {
    store.payload.department_id = v
    componentStore.departmentPositionList = []
    store.payload.department_position_id = null
    if (v.length === 0) return
    componentStore._departmentPosition(v[0].id)
  }

  const onChangeStructure = (v) => {
    store.payload.organization_id = v
    store.payload.department_id = []
    componentStore.depParams.search = null
    componentStore.departmentList = []

    componentStore.departmentPositionList = []
    store.payload.department_position_id = null

    if (v.length === 0) return
    componentStore.depParams.organizations = v[0].id
    componentStore._departmentTree()
  }

  onMounted(() => {
    componentStore._structures()
  })
</script>

<template>
  <!-- FXSH (turi 2): tashkilot ham 1-qadamga (ContractForm_1) ko'chirilgan —
       2-qadam FXSH'da bo'sh qoladi. -->
  <UIFigBlock
    v-if="store.payload.type !== 2"
    :title="$t('contractPage.step.stepTwo')"
    :icon="icons.figBriefcase"
  >
    <div class="fig-grid">
      <UIFigField
        editing
        class="fig-grid__full"
        :label="$t('documentPage.form.organization')"
        path="organization_id"
      >
        <UISelect
          :multiple="false"
          :auto-select="true"
          :checked-val="store.structureCheck"
          :loading="componentStore.structureLoading"
          :options="componentStore.structureList"
          :model-v="store.payload.organization_id"
          @updateModel="onChangeStructure"
          @updateCheck="(v) => (store.structureCheck = v)"
          @onSearch="componentStore._structures"
          v-model:search="componentStore.structureParams.search"
        />
      </UIFigField>

      <UIFigField
        editing
        class="fig-grid__wide"
        :label="$t('documentPage.form.department')"
        path="department_id"
      >
        <UIDepartment
          v-model:search="componentStore.depParams.search"
          :model-v="store.payload.department_id"
          @updateModel="onChangeDepartment"
          :checked-val="store.departmentCheck"
          @updateCheck="(v) => (store.departmentCheck = v)"
          :multiple="false"
        />
      </UIFigField>

      <UIFigField editing :label="$t('documentPage.form.position')" path="department_position_id">
        <n-select
          :disabled="!Boolean(store.payload.department_id.length)"
          v-model:value="store.payload.department_position_id"
          filterable
          :options="componentStore.departmentPositionList"
          label-field="name"
          value-field="id"
          :loading="componentStore.departmentPositionLoading"
          :render-tag="UIHelper.selectRender.value"
          :render-label="UIHelper.selectRender.labelColor"
        />
      </UIFigField>

      <UIFigField editing :label="$t('documentPage.form.group')" path="group">
        <n-select
          v-model:value="store.payload.group"
          filterable
          :options="componentStore.groupList"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
        />
      </UIFigField>

      <UIFigField editing :label="$t('documentPage.form.rank')" path="rank">
        <n-select
          v-model:value="store.payload.rank"
          filterable
          :options="componentStore.rankList"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
          clearable
        />
      </UIFigField>

      <UIFigField
        editing
        :label="$t('documentPage.form.rate')"
        :path="store.payload.position_status && store.payload.type === 2 ? 'rate_no' : 'rate'"
      >
        <n-input-number
          :max="1"
          :min="0.1"
          :step="0.1"
          :show-button="false"
          class="w-full"
          type="text"
          :allow-input="Utils.onlyAllowNumber"
          v-model:value="store.payload.rate"
        />
      </UIFigField>

      <UIFigField editing :label="$t('documentPage.form.salary')" path="salary">
        <n-input
          class="w-full"
          type="text"
          :allow-input="Utils.onlyAllowNumber"
          v-model:value="store.payload.salary"
        >
          <template #suffix>
            {{ $t('content.sum') }}
          </template>
        </n-input>
      </UIFigField>

      <UIFigField editing :label="$t('documentPage.form.tableNumber')" path="table_number">
        <n-input
          class="w-full"
          type="text"
          :allow-input="Utils.onlyAllowNumber"
          v-model:value="store.payload.table_number"
        />
      </UIFigField>
    </div>
  </UIFigBlock>
</template>
