<script setup>
  import { validationRules } from '@utils'
  import { useDepartmentStore, useComponentStore } from '@stores'
  import { SuperSelect, UIMultipleLangItems } from '@components'
  import UIHelper from '@utils/UIHelper.js'

  const store = useDepartmentStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const props = defineProps({
    callback: {
      type: Function,
      default: null
    },
    heightFull: {
      type: Boolean,
      default: true
    }
  })

  const emits = defineEmits(['onCancelEv'])
  const onCancelEv = () => {
    console.log('event')
    emits('onCancelEv')
  }

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create(props.callback)
        } else {
          store._update(props.callback)
        }
      }
    })
  }
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <div :class="[heightFull ? 'h-[calc(100vh-120px)]' : '']">
      <div
        v-if="store.parentElement"
        class="w-full text-sm px-2 py-2 border rounded-xl border-surface-line mb-4 flex flex-col cursor-pointer"
      >
        <span class="text-xs text-gray-500">{{ $t(`organizationPage.selectedOrg`) }}</span>
        <span class="text-primary font-bold">{{ store.parentElement?.name }}</span>
      </div>
      <n-form-item
        :label="$t(`departmentPage.form.name`)"
        path="name"
        :rule-path="validationRules.rulesNames.requiredStringField"
      >
        <UIMultipleLangItems>
          <template #uz-content>
            <n-input type="text" v-model:value="store.payload.name" />
          </template>
          <template #ru-content>
            <n-input type="text" v-model:value="store.payload.name_ru" />
          </template>
          <template #en-content>
            <n-input type="text" v-model:value="store.payload.name_en" />
          </template>
        </UIMultipleLangItems>
      </n-form-item>
      <n-form-item
        :label="$t(`departmentPage.form.level`)"
        path="level"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.level"
          filterable
          :options="store.levelList"
          label-field="name"
          value-field="id"
          :loading="store.levelLoading"
        />
      </n-form-item>
      <template v-if="!Boolean(store.parentElement)">
        <n-checkbox
          class="border border-surface-line w-full px-2 py-1 rounded-lg mb-4"
          v-model:checked="store.showParent"
          >{{ $t(`departmentPage.form.attachmentParent`) }}</n-checkbox
        >
        <template v-if="store.showParent">
          <n-form-item :label="$t(`departmentPage.form.parent_id`)" path="parent_id">
            <!--            <n-select-->
            <!--                v-model:value="store.payload.parent_id"-->
            <!--                filterable-->
            <!--                clearable-->
            <!--                :options="componentStore.departmentList"-->
            <!--                label-field="name"-->
            <!--                value-field="id"-->
            <!--                :loading="store.levelLoading"-->
            <!--            />-->
            <SuperSelect
              :options="componentStore.departmentList"
              v-model:value="store.payload.parent_id"
              v-model:search="componentStore.depParams.search"
              @onSearch="componentStore._onSearchDepartment"
              @onScroll="componentStore._onScrollDepartment"
              value-field="id"
              :loading="store.levelLoading"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
            />
          </n-form-item>
        </template>
      </template>

      <n-form-item :label="$t(`content.comment`)">
        <n-input :rows="2" type="textarea" v-model:value="store.payload.comment" />
      </n-form-item>
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
