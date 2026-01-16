<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useDepartmentPositionStore, useComponentStore } from '@/store/modules/index.js'
  import Utils, { generateUUIDKey } from '@/utils/Utils.js'
  import UIHelper from '@/utils/UIHelper.js'
  import { UINSelect, UISelect } from '@/components/index.js'
  import { useDebounce } from '@/utils/index.js'

  const store = useDepartmentPositionStore()
  const componentStore = useComponentStore()

  const emits = defineEmits(['onCancelEv'])
  const onCancelEv = () => {
    emits('onCancelEv')
  }

  const props = defineProps({
    callback: {
      type:Function,
      default: null,
    },
    heightFull:{
      type:Boolean,
      default:true
    }
  })

  const depParams = computed(() => ({
    ...store.depParams,
    organizations: store.payload.organization_id.map((v) => v.id).toString(),
    key: undefined
  }))
  const departmentState = computed(() => componentStore.getDepartmentState(store.depParams.key))
  const fetchDepartment = useDebounce(componentStore.createDepartmentFetcher(store.depParams.key))
  const onSearchDepartment = (v) => {
    store.depParams.page = 1
    store.depParams.search = v
    fetchDepartment(depParams.value)
  }
  const onScrollDepartment = () => {
    store.depParams.page++
    fetchDepartment(depParams.value, true)
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (store.visibleType) {
          store._create(props.callback)
        } else {
          store._update(props.callback)
        }
      }
    })
  }

  const onChangeStructure = (v) => {
    store.payload.organization_id = v
    departmentState.list = []
    store.payload.department_id = null
    fetchDepartment(depParams.value)
  }

  const updateShowEv = (v) => {
    if (!v) return
    if (!store.visibleType && departmentState.value.list.length === 1) {
      store.payload.department_id = null
      fetchDepartment(depParams.value)
    }
  }

  const showStructureField = computed(()=> !Boolean(props.callback))


  onMounted(() => {
    store.depParams.search = null
    if (store.visibleType) {
      departmentState.value.list = []
    }
  })
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div :class="[heightFull? 'h-[calc(100vh-120px)]' : '']">
      <div class="grid grid-cols-12 gap-x-4 overflow-x-hidden">
        <n-form-item v-if="showStructureField"  class="col-span-12" :label="$t(`content.organization`)">
          <UISelect
            :options="componentStore.structureList"
            :modelV="store.payload.organization_id"
            @updateModel="onChangeStructure"
            :checkedVal="store.structureCheck"
            v-model:search="componentStore.structureParams.search"
            @onSearch="componentStore._structures"
            @updateCheck="(v) => (store.structureCheck = v)"
            :loading="componentStore.structureLoading"
            :multiple="false"
            :auto-select="true"
          />
        </n-form-item>
        <n-form-item
          class="col-span-12"
          :label="$t(`departmentPositionPage.form.department_id`)"
          path="department_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <UINSelect
            clearable
            :loading="departmentState.loading"
            :options="departmentState.list"
            :total-count="departmentState.total"
            v-model:value="store.payload.department_id"
            @onSearch="onSearchDepartment"
            @onScrollEv="onScrollDepartment"
            @updateShow="updateShowEv"
          />
        </n-form-item>
        <label class="col-span-12 text-secondary mb-2"
          >{{ $t(`departmentPositionPage.form.position_id`) }}
          <span class="n-form-item-label__asterisk text-danger">&nbsp;*</span>
          <template v-if="store.payload.position_id"
            >(<span class="select-all cursor-pointer">{{ store.payload.position_id }}</span
            >)</template
          >
        </label>
        <n-form-item
          class="col-span-12"
          :show-label="false"
          :label="$t(`departmentPositionPage.form.position_id`)"
          path="position_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
          <div class="flex gap-2 w-full items-center">
            <n-select
              class="w-[calc(100% - 60px)]"
              v-model:value="store.payload.position_id"
              filterable
              clearable
              :options="componentStore.positionList"
              label-field="name"
              value-field="id"
              :loading="componentStore.positionLoading"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
            />
          </div>
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.group`)"
          path="group"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
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
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.rank`)"
          path="rank"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
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
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.max_rank`)"
          path="max_rank"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
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
            v-model:value="store.payload.rate"
          />
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-4"
          :label="$t(`departmentPositionPage.form.salary`)"
          path="salary"
          :rule-path="validationRules.rulesNames.requiredStringField"
        >
          <n-input
            v-model:value="store.payload.salary"
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
            v-model:value="store.payload.experience"
            type="text"
            :allow-input="Utils.onlyAllowNumber"
          >
            <template #suffix>
              {{ $t('content.month') }}
            </template>
          </n-input>
        </n-form-item>
        <n-form-item
          class="col-span-12 md:col-span-6 lg:col-span-8"
          :label="$t(`departmentPositionPage.form.educations`)"
          path="education"
          :rule-path="validationRules.rulesNames.requiredNumberField"
        >
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
      <n-button @click="onCancelEv" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped></style>
