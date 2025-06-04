<script setup>
import validationRules from "@/utils/validationRules.js";
import {DismissCircle28Filled} from "@vicons/fluent"
const formRef = ref(null)
import {useTicketStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import {UIUser} from "@/components/index.js"
import UIHelper from "@/utils/UIHelper.js"
import i18n from "@/i18n/index.js"

const store = useTicketStore()
const componentStore = useComponentStore()
const accountStore = useAccountStore()
const {t} = i18n.global

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      if(store.selectedWorkers.length === 0){
        $Toast.warning(t('ticket.form.requiredWorker'))
        return
      }
      store.saveLoading = true

      store.payload.worker_id = componentStore.workerList.filter((v)=>v.id === store.payload.worker_position_id)?.[0]?.worker?.id
      if (store.visibleType) {
        store._create()
      } else {
        store._update()
      }
    }
  })
}

watchEffect(()=>{
  componentStore.workerParams.organization_id = accountStore.account?.organization?.id
})



</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.common"
        :model="store.payload"
    >

      <n-form-item
          :label="$t(`ticket.form.commission_leader_id`)"
          path="commission_leader_id"
          :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
            v-model:value="store.payload.commission_leader_id"
            filterable
            clearable
            :placeholder="$t('content.searchWorker')"
            :options="componentStore.workerList"
            label-field="name"
            value-field="id"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            :loading="componentStore.workerLoading"
            @scroll="componentStore.onScrollWorker"
            @search="componentStore.onSearchWorker"
            @update:show="componentStore.onOpenWorkerEv"
        />
      </n-form-item>
      <n-form-item
          class="w-full"
          :label="$t(`ticket.form.worker_positions`)"
          path="worker_positions"
          :rule-path="validationRules.rulesNames.requiredMultiSelectField"
      >
        <n-select
            v-model:value="store.payload.worker_positions"
            filterable
            multiple
            clearable
            :placeholder="$t('content.searchWorker')"
            :options="componentStore.workerList"
            label-field="name"
            value-field="id"
            :render-label="UIHelper.selectRender.label"
            :render-tag="UIHelper.selectRender.value"
            :loading="componentStore.workerLoading"
            @scroll="componentStore.onScrollWorker"
            @search="componentStore.onSearchWorker"
            @update:show="componentStore.onOpenWorkerEv"
            :max-tag-count="1"
        />
      </n-form-item>
      <label class="text-textColor3">{{$t(`ticket.form.tickets`)}}</label>
      <div class="w-full h-[calc(100vh-320px)] overflow-y-auto">
        <template v-for="(item,index) in store.selectedWorkers" :key="index">
          <div class="flex items-center justify-between bg-surface/4 hover:bg-surface/8 mb-1 py-1 px-2 rounded-lg">
            <UIUser
                :short="false"
                :data="{
                           photo:item?.worker.photo,
                           lastName:item?.worker.last_name,
                           firstName:item?.worker.first_name,
                           middleName:item?.worker.middle_name,
                           position:item.position,
                      }"
            />
            <n-button
                @click="store._removeEv(item)"
                type="error" circle secondary size="small">
              <template #icon>
                <DismissCircle28Filled/>
              </template>
            </n-button>
          </div>


        </template>
        <template v-if="store.selectedWorkers.length === 0">
            <span class="text-center text-danger/70 text-xs mt-4 inline-block w-full">{{$t('ticket.form.no-data')}}</span>
        </template>

      </div>
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