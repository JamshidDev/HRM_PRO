<script setup>
import {CheckmarkCircle24Filled} from "@vicons/fluent"
import {NoDataPicture,UIPagination, UIMenuButton, UIUser, UIStatus} from "@/components/index.js"
import {useTicketStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useTicketStore()
const emits = defineEmits(['openEv'])

const openDocument = (v)=>{
  emits('openEv', v)
}




const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.delete){
    store.elementId = v.data.id
    store._delete(v.data)
  }else if(v.key === Utils.ActionTypes.view){
    openDocument(v.data.id)
  }else if(v.key === Utils.ActionTypes.attachment){
    store.selectedWorkers = [v.data]
    store.resetForm()
    store.visibleType = true
    store.visible = true
  }else if(v.key === Utils.ActionTypes.confirm){
    onConfirm(v.data)
  }
}

const onConfirm = (v)=>{
  store.resetConfirmForm()
  store.confirmVisible = true
  store.elementId = v.id
}


</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th v-if="store.enableCheck" class="text-center! min-w-[30px] w-[30px]"></th>
          <th class="min-w-[200px]">{{$t('content.name')}}</th>
          <th class="min-w-[30px] w-[80px]">{{$t('ticket.form.ticket')}}</th>
          <th class="min-w-[200px]">{{$t('content.organization')}}</th>
          <th class="w-[60px]">{{$t('medInspection.form.status')}}</th>
          <th class="w-[60px]">{{$t('medInspection.form.start_date')}}</th>
          <th class="w-[80px]">{{$t('content.status')}}</th>
          <th class="w-[120px]">{{$t('content.document')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div v-if="item.commission_leader_id === null" class="flex justify-center items-center">
              <n-checkbox @click="store._selectEv(item)" :checked="store._checkWorker(item.id)"></n-checkbox>
            </div>
          </td>
          <td>
            <UIUser
                :short="false"
                :data="{
                    photo:item?.worker.photo,
                    lastName:item?.worker.last_name,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    position:item?.position,
                }"
            />
          </td>
          <td>
            <div>

              <n-popover v-if="item.commission_leader_id" trigger="click" width="400">
                <n-spin :show="store.commissionLoading">
                  <div class="w-full h-[260px] overflow-y-auto">
                        <template v-for="item in store.commissionList" :key="item">
                          <div class="mb-2 bg-surface/4 p-1 rounded-lg">
                            <UIUser
                                :short="false"
                                :data="{
                                     photo:item?.worker.photo,
                                     lastName:item?.worker.last_name,
                                     firstName:item?.worker.first_name,
                                     middleName:item?.worker.middle_name,
                                     position:item?.position,
                                       }"
                            />
                          </div>
                        </template>
                  </div>
                </n-spin>


                <template #trigger>
                  <div @click="store._commission(item.id)" class="flex justify-center">
                    <n-icon size="22" class="text-success mx-auto">
                      <CheckmarkCircle24Filled/>
                    </n-icon>
                  </div>
                </template>
              </n-popover>


            </div>
          </td>
          <td>
            <span @click="openDocument(item.id)" class="hover:underline hover:text-primary cursor-pointer">{{item?.polyclinic?.name}}</span>
          </td>
          <td>
            <UIStatus v-if="item?.status?.id" :status="item?.status"/>
            <UIStatus v-else :status="Utils.documentStatus[2]"/>
          </td>
          <td>
            {{Utils.timeOnlyDate(item?.start_date)}}
          </td>
          <td>
            <UIStatus :status="item.confirmation"/>
          </td>
          <td><UIStatus :status="Utils.documentStatus[item?.generate]"/></td>
          <td>
            <UIMenuButton
                :data="item"
                :show-view="true"
                :show-attachment="true"
                :show-confirm="Boolean(item.commission_leader_id)"
                :delete-option-text="$t('content.clear')"
                :delete-warning="$t('ticket.confirm.removeCommission')"
                @selectEv="onSelectEv"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>