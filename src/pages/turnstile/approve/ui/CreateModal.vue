<script setup>
import {useApproveStore, useComponentStore} from '@/store/modules/index.js'
import validationRules from '@/utils/validationRules.js'
import {SuperSelect, UIModal, UISelect} from '@/components/index.js'

const componentStore = useComponentStore()

const formRef = ref(null)
const store = useApproveStore()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      const data = {
        ...store.payload,
        receiver_organization_id:store.payload.receiver_organization_id?.[0]?.id ?? undefined,
        worker_position_ids: store.payload.worker_position_ids,
        access_levels: store.payload.access_levels,
        approval_id:store.visibleType? undefined : store.elementId,
      }
      store._create(data)
    }
  })
}

const levelAction = {
  onSearch: () => {
    store.level.params.page = 1
    store._accessLevel()
  },
  onScroll: () => {
    store.level.params.page++
    store._accessLevel(true)
  }
}

const onChange = (v) => {
  store.worker.params.page = v.page
  store.worker.params.per_page = v.per_page
  store._workers()
}

const onChangeStructure = (v) => {
  store.payload.receiver_organization_id = v
  store.level.list = []
  store.level.params.page = 1
  store.payload.access_levels = []
  if(v.length === 0) return
  store._accessLevel()
}


const workerAction  = {
  fetch:()=>store.worker.list.length || store._workers(),
  onSearch:()=>{store.worker.params.page = 1; store._workers()},
  onScroll:()=>{store.worker.params.page++; store._workers(true)}
}

</script>

<template>

  <UIModal
      :width="900"
      v-model:visible="store.visible"

      :title="$t(store.visibleType? 'approve.createTitle' : 'approve.updateTitle')"
  >
    <template #default>
      <n-spin :show="store.showLoading">
        <n-form
            ref="formRef"
            :model="store.payload"
            :rules="validationRules.common"
            class="grid grid-cols-12 gap-x-4"
        >
          <n-form-item class="col-span-6" :label="$t('content.name')" path="title" :rule-path="validationRules.rulesNames.requiredStringField">
            <n-input v-model:value="store.payload.title" />
          </n-form-item>
          <n-form-item
              class="col-span-6"
              :label="$t(`content.organization`)"
              path="receiver_organization_id"
              :rule-path="validationRules.rulesNames.requiredMultiSelectField"
          >
            <UISelect
                :options="componentStore.allStructureList"
                :modelV="store.payload.receiver_organization_id"
                @updateModel="onChangeStructure"
                :checkedVal="store.structureCheck"
                @updateCheck="(v) => (store.structureCheck = v)"
                v-model:search="componentStore.structureParams.search"
                @onSearch="componentStore._allStructures"
                :loading="componentStore.allStructureLoading"
                :multiple="false"
            />
          </n-form-item>
          <n-form-item
              class="col-span-6"
              :label="$t(`lessonPage.form.group_id`)"
              path="access_levels"
              :rule-path="validationRules.rulesNames.requiredMultiSelectField"
          >
            <SuperSelect
                v-model:value="store.payload.access_levels"
                :options="store.level.list"
                :loading="store.level.loading"
                :total-count="store.level.totalItems"
                :per-page="store.level.params.per_page"
                :clearable="true"
                multiple
                @onSearch="levelAction.onSearch"
            />
          </n-form-item>
          <n-form-item
              class="col-span-6"
              :label="$t(`content.workers`)"
              path="worker_position_ids"
              :rule-path="validationRules.rulesNames.requiredMultiSelectField"
          >
            <SuperSelect
                v-model:value="store.payload.worker_position_ids"
                v-model:search="store.worker.params.search"
                :options="store.worker.list"
                :loading="store.worker.loading"
                :total-count="store.worker.total"
                :per-page="store.worker.params.per_page"
                @onSearch="workerAction.onSearch"
                @onScrollEv="workerAction.onScroll"
                :clearable="true"
                multiple
            />
          </n-form-item>
          <n-form-item class="col-span-12" :label="$t('content.description')" path="description">
            <n-input type="textarea" :rows="1" v-model:value="store.payload.description" />
          </n-form-item>
        </n-form>
      </n-spin>

      <div class="grid grid-cols-2 gap-2 mt-8 col-span-12">
        <n-button @click="store.visible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>

<style>
.n-form-item-blank--error .workers-form-items{
  border: 1px solid red !important;
}
</style>

