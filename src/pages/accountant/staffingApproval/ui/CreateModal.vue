<script setup>
import {useComponentStore, useStaffingApprovalStore} from "@stores"
import {SuperSelect, UIModal} from "@components"
import validationRules from "@utils/validationRules.js"
import DepartmentItem from "./DepartmentItem.vue"
import i18n from "@/i18n/index.js"
import {useAppSetting, Utils} from "@utils"

const t = i18n.global.t
const store = useStaffingApprovalStore()
const formRef = ref(null)
const expandList = ref([])

const onSubmit = ()=> {
  formRef.value?.validate((error) => {
    if (!error) {
      if(!store.payload.department_positions?.length){
        $Toast.warning(t('message.minimumOneItem'))
        return
      }
      const data = {
        department_positions:store.payload?.department_positions,
        confirmations:store.payload.confirmations,
        director_id: store.payload.director_id,
        confirmatory_id: store.payload.confirmatory_id,
        date: Utils.timeToZone(store.payload.date),
      }

      store._create(data)
    }
  })
}




const toggleExpand = (id)=>{
  const set = new Set(expandList.value)
  set.has(id)? set.delete(id) : set.add(id)
  expandList.value = [...set]
}

const expandedSet = computed(()=> new Set(expandList.value))


const workerAction = {
  fetch:()=>store.worker.list.length || store._workers(),
  onSearch:()=>{store.worker.params.page = 1; store._workers()},
  onScroll:()=>{store.worker.params.page++; store._workers(true)}
}

const leaderAction = {
  fetch:()=>store.leader.list.length || store._organizationLeader(),
  onSearch:()=>{store.leader.params.page = 1; store._organizationLeader()},
  onScroll:()=>{store.leader.params.page++; store._organizationLeader(true)}
}

const confirmationAction = {
  fetch:()=>store.confirmation.list.length || store._confirmation(),
  onSearch:()=>{store.confirmation.params.page = 1; store._confirmation()},
  onScroll:()=>{store.confirmation.params.page++; store._confirmation(true)}
}

const onChangeParent = (v) => {
  store.leader.list = []
  store.leader.params.search = null
  store.payload.director_id = null
  store.leader.params.page = 1
  if(!v) return
  store._organizationLeader()
}

</script>

<template>
  <UIModal
      :width="'1200px'"
      v-model:visible="store.visible"
      :title="$t('staffingApproval.createTitle')"
  >
    <n-form
        ref="formRef"
        :model="store.payload"
        :rules="validationRules.common"
    >
      <n-spin :show="store.generateLoading">
        <div class="w-full h-[calc(100vh-160px)] overflow-y-auto pb-10">
          <div  class="grid grid-cols-12 gap-x-4">
            <div class="col-span-12">
              <n-checkbox-group v-model:value="store.payload.department_positions">
                <div class="w-full h-[400px] bg-surface-ground border border-surface-line rounded-xl px-2 pt-2 overflow-y-auto mb-4">
                  <template v-for="item in store.positions" :key="item.id">
                    <DepartmentItem
                        :item="item"
                        :expanded="expandedSet.has(item.id)"
                        :selected-ids="store.payload.department_positions"
                        @toggle="toggleExpand(item.id)"
                        v-memo="[
expandedSet.has(item.id),
item.positions.filter(p=> store.payload.department_positions.includes(p.id)).length
]"
                    />
                  </template>
                </div>
              </n-checkbox-group>
            </div>
            <div class="col-span-4">
              <n-form-item :label="$t(`content.date`)" path="date" :rule-path="validationRules.rulesNames.requiredNumberField">
                <n-date-picker
                    class="w-full"
                    v-model:value="store.payload.date"
                    type="date"
                    :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
            </div>
            <div class="col-span-8">
              <n-form-item
                  :label="$t(`staffingApproval.form.confirmatory_id`)"
                  path="confirmatory_id"
                  :rule-path="validationRules.rulesNames.requiredNumberField"
              >
                <SuperSelect
                    v-model:value="store.payload.confirmatory_id"
                    v-model:search="store.worker.params.search"
                    :options="store.worker.list"
                    :loading="store.worker.loading"
                    :total-count="store.worker.totalItems"
                    :per-page="store.worker.params.per_page"
                    :clearable="true"
                    @onScrollEv="workerAction.onScroll"
                    @onSearch="workerAction.onSearch"
                />
              </n-form-item>
            </div>
            <div class="col-span-12 grid grid-cols-12 gap-x-4 border border-surface-line p-2 rounded-xl mb-1 bg-surface-ground/20">
              <div class="col-span-6">
                <n-form-item
                    :label="$t(`staffingApproval.form.confirmOrganization`)"
                >
                  <SuperSelect
                      v-model:value="store.leader.params.parent_id"
                      :options="store.parent.list"
                      :loading="store.parent.loading"
                      :clearable="true"
                      @update:value="onChangeParent"
                  />
                </n-form-item>
              </div>
              <div class="col-span-6">
                <n-form-item
                    :label="$t(`staffingApproval.form.director_id`)"
                    path="director_id"
                    :rule-path="validationRules.rulesNames.requiredNumberField"
                >
                  <SuperSelect
                      v-model:value="store.payload.director_id"
                      v-model:search="store.leader.params.search"
                      :options="store.leader.list"
                      :loading="store.leader.loading"
                      :total-count="store.leader.totalItems"
                      :per-page="store.leader.params.per_page"
                      :clearable="true"
                      @onScrollEv="leaderAction.onScroll"
                      @onSearch="leaderAction.onSearch"
                  />
                </n-form-item>
              </div>
            </div>
            <div class="col-span-12">
              <n-form-item
                  :label="$t(`documentPage.command.form.confirm`)"
                  path="confirmations"
                  :rule-path="validationRules.rulesNames.requiredMultiSelectField"
              >
                <SuperSelect
                    multiple
                    v-model:value="store.payload.confirmations"
                    v-model:search="store.confirmation.params.search"
                    :options="store.confirmation.list"
                    :loading="store.confirmation.loading"
                    :total-count="store.confirmation.totalItems"
                    :per-page="store.confirmation.params.per_page"
                    :clearable="true"
                    @onScrollEv="confirmationAction.onScroll"
                    @onSearch="confirmationAction.onSearch"
                />
              </n-form-item>
            </div>
          </div>
        </div>
      </n-spin>
      <div class="grid grid-cols-12 gap-4">
        <n-button class="col-span-6" @click="store.visible = false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button class="col-span-6" @click="onSubmit" :loading="store.saveLoading" type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>

