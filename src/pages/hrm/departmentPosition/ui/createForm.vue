<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useDepartmentPositionStore, useComponentStore} from "@/store/modules/index.js";
import Utils from "@/utils/Utils.js"

const store = useDepartmentPositionStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store.saveLoading = true
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
      <div class="grid grid-cols-3 gap-x-4">
        <n-form-item class="col-span-3" :label="$t(`departmentPositionPage.form.position_id`)" path="position_id">
          <n-select
              v-model:value="store.payload.position_id"
              filterable
              clearable
              :placeholder="$t(`departmentPositionPage.form.position_id`)"
              :options="componentStore.positionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.positionLoading"
          />
        </n-form-item>
        <n-form-item class="col-span-3" :label="$t(`departmentPositionPage.form.department_id`)" path="department_id">
          <n-select
              v-model:value="store.payload.department_id"
              filterable
              clearable
              :placeholder="$t(`departmentPositionPage.form.department_id`)"
              :options="componentStore.departmentList"
              label-field="name"
              value-field="id"
              :loading="componentStore.departmentLoading"
          />
        </n-form-item>
        <n-form-item :label="$t(`departmentPositionPage.form.group`)" path="group">
          <n-select
              v-model:value="store.payload.group"
              filterable
              clearable
              :placeholder="$t(`departmentPositionPage.form.group`)"
              :options="componentStore.groupList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"

          />
        </n-form-item>
        <n-form-item :label="$t(`departmentPositionPage.form.rank`)" path="rank">
          <n-select
              v-model:value="store.payload.rank"
              filterable
              clearable
              :placeholder="$t(`departmentPositionPage.form.rank`)"
              :options="componentStore.rankList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
          />
        </n-form-item>
        <n-form-item :label="$t(`departmentPositionPage.form.rate`)" path="rate">
          <n-input
              v-model:value="store.payload.rate"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
              :placeholder="$t(`departmentPositionPage.form.rate`)"
          />
        </n-form-item>
        <n-form-item :label="$t(`departmentPositionPage.form.salary`)" path="salary">
          <n-input
              v-model:value="store.payload.salary"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
              :placeholder="$t(`departmentPositionPage.form.salary`)"
          >
            <template #suffix>
              {{$t('content.sum')}}
            </template>
          </n-input>
        </n-form-item>
        <n-form-item :label="$t(`departmentPositionPage.form.experience`)" path="experience">
          <n-input
              v-model:value="store.payload.experience"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
              :placeholder="$t(`departmentPositionPage.form.experience`)"
          >
            <template #suffix>
              {{$t('content.month')}}
            </template>
          </n-input>
        </n-form-item>
        <n-form-item class="col-span-1" :label="$t(`departmentPositionPage.form.educations`)" path="educations">
          <n-select
              v-model:value="store.payload.educations"
              filterable
              clearable
              :placeholder="$t(`departmentPositionPage.form.educations`)"
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