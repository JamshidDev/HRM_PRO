<script setup>
  import { validationRules } from '@utils'
  import { useDepartmentStore, useComponentStore } from '@stores'
  import { UIMultipleLangItems } from '@components'

  const store = useDepartmentStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
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
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <div style="min-height: calc(100vh - 120px)">
      <div
        v-if="store.parentElement"
        class="w-full text-sm px-2 py-2 border rounded-xl border-surface-line mb-4 flex flex-col cursor-pointer"
      >
        <span class="text-xs text-gray-500">{{ $t(`organizationPage.selectedOrg`) }}</span>
        <span class="text-primary font-bold">{{ store.parentElement?.name }}</span>
      </div>
      <n-form-item :label="$t(`departmentPage.form.name`)" path="name" :rule-path="validationRules.rulesNames.requiredStringField">
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
      <n-form-item :label="$t(`departmentPage.form.level`)" path="level" :rule-path="validationRules.rulesNames.requiredNumberField">
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
        <n-checkbox class="border border-surface-line w-full px-2 py-1 rounded-lg mb-4" v-model:checked="store.showParent">{{$t(`departmentPage.form.attachmentParent`)}}</n-checkbox>
        <template v-if="store.showParent">
          <n-form-item
              :label="$t(`departmentPage.form.parent_id`)"
              path="parent_id"
          >
            <n-select
                v-model:value="store.payload.parent_id"
                filterable
                clearable
                :options="componentStore.departmentList"
                label-field="name"
                value-field="id"
                :loading="store.levelLoading"
            />
          </n-form-item>
        </template>
      </template>


      <n-form-item :label="$t(`content.comment`)">
        <n-input :rows="2" type="textarea" v-model:value="store.payload.comment" />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
