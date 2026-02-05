<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useReport2Store, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { SuperSelect } from '@components'

  const store = useReport2Store()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        let data = { ...store.positionPayload }

        if (store.position.visibleType) {
          store.onCreatePosition(data)
        } else {
          store.onUpdatePosition(data)
        }
      }
    })
  }

  onMounted(() => {
    componentStore._positions()
    componentStore._enums()
  })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.positionPayload">
    <n-spin :show="store.showLoading">
      <div>
        <div class="grid grid-cols-12 gap-x-4 overflow-x-hidden">
          <n-form-item
            class="col-span-12"
            :label="$t(`departmentPositionPage.form.position_id`)"
            path="position_id"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <n-select
              v-model:value="store.positionPayload.position_id"
              filterable
              clearable
              :options="componentStore.positionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.positionLoading"
            />
          </n-form-item>
          <n-form-item
            class="col-span-12"
            :label="$t(`departmentPositionPage.form.department_id`)"
            path="department_id"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <SuperSelect
              :options="componentStore.departmentList"
              v-model:value="store.positionPayload.department_id"
              v-model:search="componentStore.depParams.search"
              @onSearch="componentStore._onSearchDepartment"
              @onScroll="componentStore._onScrollDepartment"
              value-field="id"
              :loading="componentStore.departmentLoading"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
            />
            <!--            <n-select-->
            <!--              v-model:value="store.positionPayload.department_id"-->
            <!--              filterable-->
            <!--              :filter="() => true"-->
            <!--              clearable-->
            <!--              :options="componentStore.departmentList"-->
            <!--              :render-label="UIHelper.selectRender.label"-->
            <!--              :render-tag="UIHelper.selectRender.value"-->
            <!--              value-field="id"-->
            <!--              :loading="componentStore.departmentLoading"-->
            <!--              @search="componentStore._onSearchDepartment"-->
            <!--              @scroll="componentStore._onScrollDepartment"-->
            <!--              :reset-menu-on-options-change="true"-->
            <!--            />-->
          </n-form-item>
          <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-4"
            :label="$t(`departmentPositionPage.form.group`)"
            path="group"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <n-select
              v-model:value="store.positionPayload.group"
              filterable
              clearable
              :options="componentStore.groupList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
            />
          </n-form-item>
          <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-4"
            :label="$t(`departmentPositionPage.form.rank`)"
            path="rank"
            :rule-path="validationRules.rulesNames.requiredStringField"
          >
            <n-select
              v-model:value="store.positionPayload.rank"
              filterable
              clearable
              :options="componentStore.rankList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
            />
          </n-form-item>
          <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-4"
            :label="$t(`departmentPositionPage.form.max_rank`)"
            path="max_rank"
            :rule-path="validationRules.rulesNames.requiredStringField"
          >
            <n-select
              v-model:value="store.positionPayload.max_rank"
              filterable
              clearable
              :options="componentStore.rankList"
              label-field="name"
              value-field="id"
              :loading="componentStore.enumLoading"
            />
          </n-form-item>
          <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-4"
            :label="$t(`departmentPositionPage.form.rate`)"
            path="rate"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <n-input-number
              :max="300"
              :min="0.1"
              :step="0.1"
              :show-button="false"
              class="w-full"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
              v-model:value="store.positionPayload.rate"
            />
          </n-form-item>
          <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-4"
            :label="$t(`departmentPositionPage.form.salary`)"
            path="salary"
            :rule-path="validationRules.rulesNames.requiredStringField"
          >
            <n-input
              v-model:value="store.positionPayload.salary"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
            >
              <template #suffix>
                {{ $t('content.sum') }}
              </template>
            </n-input>
          </n-form-item>
          <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-4"
            :label="$t(`departmentPositionPage.form.experience`)"
            path="experience"
            :rule-path="validationRules.rulesNames.requiredStringField"
          >
            <n-input
              v-model:value="store.positionPayload.experience"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
            >
              <template #suffix>
                {{ $t('content.month') }}
              </template>
            </n-input>
          </n-form-item>
          <n-form-item
            class="col-span-12 md:col-span-6 lg:col-span-4"
            :label="$t(`departmentPositionPage.form.educations`)"
            path="education"
            :rule-path="validationRules.rulesNames.requiredNumberField"
          >
            <n-select
              v-model:value="store.positionPayload.education"
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
    </n-spin>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped></style>
