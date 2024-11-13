<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useDepartmentStore, useComponentStore} from "@/store/modules/index.js";

const store = useDepartmentStore()
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
      :rules="validationRules.departmentPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <div v-if="store.parentElement" class="w-full text-sm px-2 py-2 border rounded-xl border-surface-line mb-4 flex flex-col cursor-pointer">
        <span class="text-xs text-gray-500">{{$t(`organizationPage.selectedOrg`)}}</span>
        <span class="text-primary font-bold">{{store.parentElement?.name}}</span>
      </div>
      <n-form-item :label="$t(`departmentPage.form.name`)" path="name">
        <n-input
            type="text"
            :placeholder="$t(`departmentPage.form.name`)"
            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`departmentPage.form.level`)" path="level">
        <n-select
            v-model:value="store.payload.level"
            filterable
            :placeholder="$t(`departmentPage.form.level`)"
            :options="store.levelList"
            label-field="name"
            value-field="id"
            :loading="store.levelLoading"
        />
      </n-form-item>
      <n-form-item
          v-if="!Boolean(store.parentElement)"
          :label="$t(`departmentPage.form.parent_id`)" path="parent_id">
        <n-select
            v-model:value="store.payload.parent_id"
            filterable
            clearable
            :placeholder="$t(`departmentPage.form.parent_id`)"
            :options="componentStore.departmentList"
            label-field="name"
            value-field="id"
            :loading="store.levelLoading"

        />
      </n-form-item>
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