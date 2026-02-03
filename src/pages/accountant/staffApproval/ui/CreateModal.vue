<script setup>
import {useComponentStore, useStaffApprovalStore} from "@stores"
import {UIModal, UIUser} from "@components"
import validationRules from "@utils/validationRules.js"
import {DismissCircle28Filled, Drag24Filled, DrawText24Regular} from "@vicons/fluent"
import {VueDraggable} from "vue-draggable-plus"
import DepartmentItem from "./DepartmentItem.vue"
import {NAvatar} from "naive-ui"
import Utils from "@utils/Utils.js"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@utils"

const t = i18n.global.t
const store = useStaffApprovalStore()
const componentStore = useComponentStore()
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
        confirmatory_id: store.payload.finance_id ?? undefined,
      }

      store._create(data)
    }
  })
}


const fetchConfirmation = () => {
  if(componentStore.confirmationList.length>0) return
  componentStore._confirmations()
}
const onChangeDraggle = () => {
  store.payload.confirmations = store.sortableConfirmations.map((v) => v.id)
}
const onChangeConfirmation = () => {
  fillSortableConfirmations()
  syncConfirmationEv()
}
const confirmationList = computed(()=>{
  const exclude = new Set([store.payload.finance_id, store.payload.director_id])
  return componentStore.confirmationList.filter(v=> !exclude.has(v.id))
})

const financeList = computed(()=> componentStore.confirmationList.filter(v=>v.id !== store.payload.director_id))
const syncConfirmationEv = () => {
  if(store.payload.finance_id === store.payload.director_id) store.payload.finance_id = null
  onRemoveEv(store.payload.finance_id)
  onRemoveEv(store.payload.director_id)
}
const fillSortableConfirmations = () => {
  store.sortableConfirmations = confirmationList.value
      .filter((v) => store.payload.confirmations.includes(v.id))
      .map((v) => ({
        id: v.id,
        data: {
          firstName: v.first_name,
          lastName: v.last_name,
          middleName: v.middle_name,
          photo: v.photo,
          position: v?.position || ''
        }
      }))
}
const onRemoveEv = (id) =>{
  store.sortableConfirmations = store.sortableConfirmations.filter(v=>v.id !== id)
  store.payload.confirmations = store.payload.confirmations.filter(v=>v !== id)
}

const renderLabel = (option) => {
  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center px-2'
        },
        [
          h(NAvatar, {
            class: '',
            src: option.photo,
            'fallback-src': Utils.noAvailableImage
          }),
          h('div', { class: 'flex flex-col' }, [
            h(
                'div',
                { class: 'text-xs font-medium text-gray-500 leading-[1.2]' },
                `${option.last_name}.${option.first_name[0]}.${option.middle_name[0]}`
            ),
            h('div', { class: 'text-xs text-primary leading-[1.2]' }, option.position)
          ])
        ]
    )
  ]
}
const renderValue = ({ option }) => {
  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        },
        `${option?.last_name} ${option?.first_name} ${option?.middle_name}`
    )
  ]
}

const toggleExpand = (id)=>{
  const set = new Set(expandList.value)
  set.has(id)? set.delete(id) : set.add(id)
  expandList.value = [...set]
}

const expandedSet = computed(()=> new Set(expandList.value))



onMounted(()=>{
  fetchConfirmation()
})

</script>

<template>
  <UIModal
      :width="'1200px'"
      v-model:visible="store.visible"
      :title="$t('staffApproval.createTitle')"
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
            <div class="col-span-2">
              <n-form-item :label="$t(`content.date`)" path="date" :rule-path="validationRules.rulesNames.requiredNumberField">
                <n-date-picker
                    class="w-full"
                    v-model:value="store.payload.date"
                    type="date"
                    :format="useAppSetting.datePicketFormat"
                />
              </n-form-item>
            </div>
            <div class="col-span-5">
              <n-form-item
                  :label="$t(`documentPage.command.form.director_id`)"
                  path="director_id"
                  :rule-path="validationRules.rulesNames.requiredNumberField"
              >
                <n-select
                    value-field="id"
                    label-field="last_name"
                    v-model:value="store.payload.director_id"
                    :options="componentStore.confirmationList"
                    :loading="componentStore.confirmationLoading"
                    :render-label="renderLabel"
                    :render-tag="renderValue"
                    @update:value="syncConfirmationEv"
                />
              </n-form-item>
            </div>
            <div class="col-span-5">
              <n-form-item :label="$t(`documentPage.command.form.finance_id`)">
                <n-select
                    :disabled="!store.payload.director_id"
                    value-field="id"
                    label-field="last_name"
                    v-model:value="store.payload.finance_id"
                    :options="financeList"
                    :loading="componentStore.confirmationLoading"
                    :render-label="renderLabel"
                    :render-tag="renderValue"
                    @update:value="syncConfirmationEv"
                />
              </n-form-item>
            </div>
            <div class="col-span-12">
              <n-form-item
                  :label="$t(`documentPage.command.form.confirm`)"
                  path="confirmations"
                  :rule-path="validationRules.rulesNames.requiredMultiSelectField"
              >
                <n-select
                    :disabled="!store.payload.director_id"
                    size="large"
                    value-field="id"
                    multiple
                    v-model:value="store.payload.confirmations"
                    :options="confirmationList"
                    :loading="componentStore.confirmationLoading"
                    :render-label="renderLabel"
                    :render-tag="renderValue"
                    @update:value="onChangeConfirmation"
                    :max-tag-count="1"
                />
              </n-form-item>
            </div>
            <template v-if="store.sortableConfirmations?.length">
              <div class="col-span-12 pb-2 px-2 flex justify-between">
              <span class="text-secondary">{{
                  $t('documentPage.command.form.viewDescription')
                }}</span>
                <n-checkbox v-model:checked="store.oneByOne">
                  {{
                    $t(
                        store.oneByOne
                            ? 'documentPage.command.form.viewOneByOne'
                            : 'documentPage.command.form.viewSameTime'
                    )
                  }}
                </n-checkbox>
              </div>
              <div class="col-span-12">
                <VueDraggable v-model="store.sortableConfirmations" @end="onChangeDraggle">
                  <div
                      v-for="(item, index) in store.sortableConfirmations"
                      :key="item.id"
                      class="sort-target flex items-center gap-2 px-2 py-1 bg-surface-section border border-surface-line rounded-xl mb-1"
                  >
                    <div class="handle">
                      <n-icon
                          size="24"
                          class="text-secondary cursor-move scale-100 hover:scale-[1.2] mx-2"
                      >
                        <Drag24Filled />
                      </n-icon>
                    </div>

                    <div class="w-[calc(100%-60px)] select-none flex">
                      <UIUser class="!w-full" :data="item.data" :hide-tooltip="true" :short="false" />
                    </div>
                    <template v-if="store.oneByOne">
                      <n-button type="primary" secondary :icon-placement="'right'" size="small">
                        <template #icon>
                          <DrawText24Regular />
                        </template>
                        <span class="font-bold text-lg">{{ index + 1 }}</span>
                      </n-button>
                    </template>
                    <n-button @click="onRemoveEv(item.id)" type="error" circle secondary>
                      <template #icon>
                        <DismissCircle28Filled />
                      </template>
                    </n-button>
                  </div>
                </VueDraggable>
              </div>
            </template>
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

