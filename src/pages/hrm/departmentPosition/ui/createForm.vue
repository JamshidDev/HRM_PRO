<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useDepartmentPositionStore, useComponentStore} from "@/store/modules/index.js";
import Utils from "@/utils/Utils.js"
import UIHelper from "@/utils/UIHelper.js"
import {UISelect} from "@/components/index.js"

const store = useDepartmentPositionStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }


    }
  })
}


</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.departmentPositionPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <div class="grid grid-cols-12 gap-x-4 overflow-x-hidden">
        <n-form-item class="col-span-12" :label="$t(`content.organization`)">
          <UISelect
              :options="componentStore.structureList"
              :modelV="store.payload.organization_id"
              @defaultValue="(v)=>store.payload.organization_id=v"
              @updateModel="store.onChangeStructure"
              :checkedVal="store.structureCheck"
              v-model:search="componentStore.structureParams.search"
              @onSearch="componentStore._structures"
              @updateCheck="(v)=>store.structureCheck=v"
              :loading="componentStore.structureLoading"
              :multiple="false"
              :auto-select="true"
          />
        </n-form-item>
        <n-form-item class="col-span-12" :label="$t(`departmentPositionPage.form.department_id`)" path="department_id">
          <n-select
              :disabled="store.payload.organization_id.length === 0"
              v-model:value="store.payload.department_id"
              filterable
              :filter="()=>true"
              clearable
              :options="componentStore.departmentList"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
              value-field="id"
              :loading="componentStore.departmentLoading"
              @search="componentStore._onSearchDepartment"
              @scroll="componentStore._onScrollDepartment"
              @update:show="componentStore.onOpenDepartmentEv"
              :ignore-composition="false"
          />
        </n-form-item>
        <n-form-item class="col-span-12" :label="$t(`departmentPositionPage.form.position_id`)" path="position_id">
          <n-select
              v-model:value="store.payload.position_id"
              filterable
              clearable

              :options="componentStore.positionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.positionLoading"
          />
        </n-form-item>
        <n-form-item class="col-span-12 md:col-span-6 lg:col-span-4" :label="$t(`departmentPositionPage.form.group`)" path="group">
          <n-select
              v-model:value="store.payload.group"
              filterable
              clearable

              :options="componentStore.groupList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"

          />
        </n-form-item>
        <n-form-item class="col-span-12 md:col-span-6 lg:col-span-4" :label="$t(`departmentPositionPage.form.rank`)" path="rank">
          <n-select
              v-model:value="store.payload.rank"
              filterable
              clearable

              :options="componentStore.rankList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
          />
        </n-form-item>
        <n-form-item class="col-span-12 md:col-span-6 lg:col-span-4" :label="$t(`departmentPositionPage.form.max_rank`)" path="max_rank">
          <n-select
              v-model:value="store.payload.max_rank"
              filterable
              clearable

              :options="componentStore.rankList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
          />
        </n-form-item>
        <n-form-item class="col-span-12 md:col-span-6 lg:col-span-4" :label="$t(`departmentPositionPage.form.rate`)" path="rate">
          <n-input
              v-model:value="store.payload.rate"
              type="text"
              :allow-input="Utils.onlyAllowNumber"

          />
        </n-form-item>
        <n-form-item class="col-span-12 md:col-span-6 lg:col-span-4" :label="$t(`departmentPositionPage.form.salary`)" path="salary">
          <n-input
              v-model:value="store.payload.salary"
              type="text"
              :allow-input="Utils.onlyAllowNumber"

          >
            <template #suffix>
              {{$t('content.sum')}}
            </template>
          </n-input>
        </n-form-item>
        <n-form-item class="col-span-12 md:col-span-6 lg:col-span-4" :label="$t(`departmentPositionPage.form.experience`)" path="experience">
          <n-input
              v-model:value="store.payload.experience"
              type="text"
              :allow-input="Utils.onlyAllowNumber"

          >
            <template #suffix>
              {{$t('content.month')}}
            </template>
          </n-input>
        </n-form-item>
        <n-form-item class="col-span-12 md:col-span-6 lg:col-span-8" :label="$t(`departmentPositionPage.form.educations`)" path="educations">
          <n-select
              v-model:value="store.payload.education"
              filterable
              clearable

              :options="componentStore.educationList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
          />
        </n-form-item>
      </div>

    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>