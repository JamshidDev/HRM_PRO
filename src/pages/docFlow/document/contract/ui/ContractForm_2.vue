<script setup>
  import Utils from '@/utils/Utils.js'
  import { UIUpload, UISelect } from '@/components/index.js'
  import UIDepartment from '@/components/ui/UIDepartment.vue'
  import { useComponentStore, useContractStore } from '@/store/modules/index.js'
  import UIHelper from '@utils/UIHelper.js'

  const store = useContractStore()
  const componentStore = useComponentStore()

  const onChangeStatus = (v) => {
    if (!v) {
      componentStore._positions()
    }
  }

  const showCheckBox = computed(() => {
    return [2, 4, 5].includes(store.payload.type)
  })

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
  <div class="grid grid-cols-12 gap-x-4">
    <div
      class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4"
    >
      <div class="grid grid-cols-12 gap-x-4">
        <div class="col-span-12">
          <n-form-item :label="$t(`documentPage.form.organization`)" path="organization_id">
            <UISelect
              :multiple="false"
              :auto-select="true"
              :checkedVal="store.structureCheck"
              :loading="componentStore.structureLoading"
              :options="componentStore.structureList"
              :modelV="store.payload.organization_id"
              @updateModel="onChangeStructure"
              @updateCheck="(v) => (store.structureCheck = v)"
              @onSearch="componentStore._structures"
              v-model:search="componentStore.structureParams.search"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t(`documentPage.form.department`)" path="department_id">
            <UIDepartment
              v-model:search="componentStore.depParams.search"
              :modelV="store.payload.department_id"
              @updateModel="onChangeDepartment"
              :checkedVal="store.departmentCheck"
              @updateCheck="(v) => (store.departmentCheck = v)"
              :multiple="false"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t(`documentPage.form.position`)" path="department_position_id">
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
          </n-form-item>
        </div>

        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item :label="$t(`documentPage.form.group`)" path="group">
            <n-select
              v-model:value="store.payload.group"
              filterable
              :options="componentStore.groupList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-3">
          <n-form-item :label="$t(`documentPage.form.rank`)" path="rank">
            <n-select
              v-model:value="store.payload.rank"
              filterable
              :options="componentStore.rankList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
              clearable
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item
            :label="$t(`documentPage.form.rate`)"
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
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item :label="$t(`documentPage.form.salary`)" path="salary">
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
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-6 lg:col-span-2">
          <n-form-item :label="$t(`documentPage.form.tableNumber`)" path="table_number">
            <n-input
              class="w-full"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
              v-model:value="store.payload.table_number"
            />
          </n-form-item>
        </div>

        <!--        <div class="col-span-12">-->
        <!--          <n-form-item :label="$t(`documentPage.form.postName`)" path="post_name">-->
        <!--            <n-input-->
        <!--                class="w-full"-->
        <!--                type="text"-->
        <!--                -->
        <!--                v-model:value="store.payload.post_name"-->
        <!--            />-->
        <!--          </n-form-item>-->
        <!--        </div>-->
      </div>
    </div>

    <!--    <div class="col-span-12 border border-dashed p-2 rounded-xl border-surface-line bg-surface-ground mt-4">-->
    <!--      <div class="grid grid-cols-12 gap-x-4">-->
    <!--        <div class="col-span-12">-->
    <!--          <UIUpload v-model:files="store.payload.files" />-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<style scoped></style>
