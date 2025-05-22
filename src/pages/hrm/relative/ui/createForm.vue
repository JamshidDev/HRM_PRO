<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useRelativeStore, useComponentStore} from "@/store/modules/index.js";
import {UIAutoComplete} from "@/components/index.js"
import {useAppSetting} from "@/utils/index.js"

const store = useRelativeStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      store.saveLoading = true
      if (store.visibleType) {
        store.payload.worker_id = null
        console.log(componentStore.worker)
        if(store.activeTab === store.tabList[1].id){
          store.payload.worker_id = componentStore.worker.pin
        }
        store._create()
      } else {
        store._update()
      }


    }
  })
}

const rules = computed(()=>{
  return store.activeTab === store.tabList[0].id? validationRules.relativePage :validationRules.relativePageV2
})

const beforeLeave = computed(()=>{
  return !store.visibleType
})

onMounted(()=>{
  if(componentStore.maritalList.length === 0){
    componentStore._enums()
  }
})


</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="rules"
        :model="store.payload"
    >
      <n-tabs @before-leave="beforeLeave" animated v-model:value="store.activeTab"  type="segment">

        <n-tab-pane v-for="(item) in store.tabList"  :name="item.id" :tab="$t(item.name)">
          <template v-if="store.tabList[0].id === store.activeTab">
            <n-form-item :label="$t(`relativePage.form.relative`)" path="relative">
              <n-select
                  v-model:value="store.payload.relative"
                  filterable

                  :options="componentStore.relativesList"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.enumLoading"
              />
            </n-form-item>
            <n-form-item :label="$t(`createWorkerPage.form.lastName`)" path="last_name">
              <n-input
                  type="text"

                  v-model:value="store.payload.last_name"
              />
            </n-form-item>
            <n-form-item :label="$t(`createWorkerPage.form.firstName`)" path="first_name">
              <n-input
                  type="text"

                  v-model:value="store.payload.first_name"
              />
            </n-form-item>
            <n-form-item :label="$t(`createWorkerPage.form.middleName`)" path="middle_name">
              <n-input
                  type="text"

                  v-model:value="store.payload.middle_name"
              />
            </n-form-item>
            <n-form-item
                :label="$t(`createWorkerPage.form.birthday`)"
                path="birthday">
              <n-date-picker
                  class="w-full"
                  v-model:value="store.payload.birthday"
                  type="date"

                  :format="useAppSetting.datePicketFormat"
              />
            </n-form-item>
            <n-form-item :label="$t(`relativePage.form.post_name`)" path="post_name">
              <n-input
                  type="text"

                  v-model:value="store.payload.post_name"
              />
            </n-form-item>
            <n-form-item
                :label="$t(`relativePage.form.birth_place`)"
                path="birth_place">
              <n-input
                  type="text"

                  v-model:value="store.payload.birth_place"
              />
            </n-form-item>
            <n-form-item :label="$t(`createWorkerPage.form.address`)" path="address">
              <n-input
                  type="text"

                  v-model:value="store.payload.address"
              />
            </n-form-item>
          </template>
          <template v-if="store.tabList[1].id === store.activeTab">
            <n-form-item :label="$t(`relativePage.form.relative`)" path="relative">
              <n-select
                  v-model:value="store.payload.relative"
                  filterable

                  :options="componentStore.relativesList"
                  label-field="name"
                  value-field="id"
                  :loading="componentStore.enumLoading"
              />
            </n-form-item>
            <UIAutoComplete
                v-model:pin="store.payload.pin"
            />
            <div class="w-full mb-16"></div>
          </template>

        </n-tab-pane>
      </n-tabs>
    </n-form>

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


</template>

<style scoped>

</style>