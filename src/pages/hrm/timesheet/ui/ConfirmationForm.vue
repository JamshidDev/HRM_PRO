<script setup>
import {useComponentStore, useTimesheetConfirmStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js";
import {NAvatar} from "naive-ui";
import Utils from "@/utils/Utils.js";
import {VueDraggable} from 'vue-draggable-plus';
import {Delete20Filled, ArrowMoveInward20Filled, Star28Filled} from '@vicons/fluent'
import {NoDataPicture, UIStatus} from "@/components/index.js";


const formRef = ref(null)
const store = useTimesheetConfirmStore()
const componentStore = useComponentStore()

onMounted(() => {
  componentStore._confirmations()
  store._index()
})

const renderLabel = (option) => {
  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        }, `${option?.last_name} ${option?.first_name} ${option?.middle_name}`),
  ];
}


const renderMainVerifier = (option) => {
  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        }, `${option?.last_name} ${option?.first_name} ${option?.middle_name}`),
  ];
}

const renderValue = ({option}) => {

  return [
    h(
        'div',
        {
          class: 'flex gap-2 my-1 items-center'
        }, `${option?.last_name} ${option?.first_name} ${option?.middle_name}`),
  ];
}


const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      store._create()
    }
  })
}

</script>
<template>
  <n-tabs type="segment" default-value="view" class="h-full">
    <n-tab-pane name="view" :tab="$t('content.view')" class="h-full">
      <n-spin :show="store.loading" class="grow min-h-[200px]">
        <NoDataPicture v-if="!store.loading && !store.list.length" />
        <template v-else>
          <div class="flex flex-col gap-2">
            <template v-for="(item, idx) in store.list" :key="idx">
              <n-divider v-if="idx!==0" class="my-2!" />
            <div
                 class="flex gap-2 p-1 items-center ">
              <div class="flex grow group justify-between">
                 <div class="flex gap-1 items-center">
                    <n-avatar
                      size="large"
                      :fallback-src="Utils.noAvailableImage"
                      :src="item.worker.photo"
                    />

                  <div class='flex flex-col'>
                    <div class="text-xs font-medium text-gray-500">
                      {{ `${item.worker.last_name}.${item.worker.last_name[0]}.${item.worker.middle_name[0]}` }}
                      <span>
                         <n-icon-wrapper v-if="item.main" color="success" :border-radius="100" :size="18">
                            <n-icon color="success" :component="Star28Filled" />
                         </n-icon-wrapper>
                      </span>
                    </div>
                    <div class="text-xs text-gray-400">{{ item.position }}</div>
                  </div>
                </div>
                <UIStatus :status="item.status" />

              </div>
              <n-tooltip trigger="hover">
                {{$t('content.delete')}}
                <template #trigger>
                  <n-button
                      dashed
                      size="tiny"
                      type="error"
                      @click="()=>store._delete(item.id)"
                  >
                    <template #icon>
                      <n-icon :component="Delete20Filled"/>
                    </template>
                  </n-button>
                </template>
              </n-tooltip>
            </div>
            </template>
          </div>

        </template>
      </n-spin>
    </n-tab-pane>
    <n-tab-pane name="edit" class="h-full" :tab="$t('content.edit')">
        <n-form
            ref="formRef"
            :model="store.payload"
            :rules="validationRules.common"
            class="flex flex-col h-full"
        >
          <n-form-item :label="$t('timesheetPage.verifiers')" path="confirmations">
            <n-select
                v-model:value="store.payload.confirmations"
                :loading="componentStore.confirmationLoading"
                :max-tag-count="1"
                :options="componentStore.confirmationList"
                :placeholder="$t(`content.choose`)"
                :render-label="renderLabel"
                :render-tag="renderValue"
                filterable
                label-field="last_name"
                multiple
                value-field="id"
                @update-value="(_, objects)=>store.payload.confirmationObjects = objects"
            />
          </n-form-item>
          <n-form-item :label="$t('timesheetPage.mainVerifier')" :show-feedback="false" :span="9">
            <n-select
                v-model:value="store.payload.mainUser"
                :options="store.payload.confirmationObjects"
                :placeholder="$t(`content.choose`)"
                :render-label="renderMainVerifier"
                filterable
                value-field="id"
                @update-value="console.log"
            />
          </n-form-item>
          <n-divider/>
          <VueDraggable
              v-model="store.payload.confirmationObjects"
              :animation="150"
              class="flex flex-col gap-2"
              handle=".handle"
              @end="(v)=>{
            if(v.newIndex!==v.oldIndex){

            }
          }"
          >
            <div v-for="(item, idx) in store.payload.confirmationObjects" :key="idx"
                 class="flex gap-2 border border-surface-line rounded-md px-1 py-2 ">
              <n-button class="handle cursor-move! shrink-0" size="small" text type="primary">
                <template #icon>
                  <n-icon :component="ArrowMoveInward20Filled"/>
                </template>
              </n-button>
              <!--          <n-tooltip trigger="hover">-->
              <!--            {{$t('content.delete')}}-->
              <!--            <template #trigger>-->
              <!--              <n-button-->
              <!--                  circle-->
              <!--                  quaternary-->
              <!--                  type="error"-->
              <!--                  @click="()=>store._delete(item.id)"-->
              <!--              >-->
              <!--                <template #icon>-->
              <!--                  <n-icon :component="Delete20Filled"/>-->
              <!--                </template>-->
              <!--              </n-button>-->
              <!--            </template>-->
              <!--          </n-tooltip>-->
              <div class="flex grow group justify-between">
                <div class="flex gap-4 items-center">
                  <n-badge :show="item.id === store.payload.mainUser" class="inline-flex justify-center items-center"
                           type="warning">
                    <n-avatar
                        :fallback-src="Utils.noAvailableImage"
                        :src="item.photo"

                    ></n-avatar>
                    <template #value>
                      <n-icon :component="Star28Filled"/>
                    </template>
                  </n-badge>
                  <div class='flex flex-col'>
                    <div class="text-xs font-medium text-gray-500">
                      {{ `${item.last_name}.${item.last_name[0]}.${item.middle_name[0]}` }}
                    </div>
                    <div class="text-xs text-gray-400">{{ item.position }}</div>
                  </div>
                </div>
              </div>

            </div>
          </VueDraggable>


          <div class="mt-auto">
            <n-button
                :loading="store.saveLoading"
                block
                type="primary"
                @click="onSubmit"
            >
              {{ $t('content.save') }}
            </n-button>
          </div>
        </n-form>
    </n-tab-pane>
  </n-tabs>


</template>

<style scoped>

</style>