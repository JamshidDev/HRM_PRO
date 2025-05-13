<script setup>
import {NoDataPicture, UIPagination, UIUser, UIMenuButton, UIWorkerView} from "@/components/index.js"
import {useTimesheetDepartmentStore, useWorkerStore, useExportStore, useAccountStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"
import {Edit32Regular, Eye16Regular, Table24Regular} from "@vicons/fluent"
import UIHelper from "@/utils/UIHelper.js"
import i18n from "@/i18n/index.js"


const store = useWorkerStore()
const accStore = useAccountStore()
const exportStore = useExportStore()

const timesheetDepartmentStore = useTimesheetDepartmentStore()
const {t} = i18n.global

const router = useRouter()
const previewRef = ref(null)
const selectedItem = ref(null)



const goPush =(v)=>{
  router.push({
    path:`${AppPaths.Hrm}${AppPaths.WorkerProfile}`,
    query:{id:v.worker.uuid},
  })
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(!accStore.checkAction(accStore.pn.hrWorkersRead)) return

  if(v.key === Utils.ActionTypes.view){
    previewRef.value.openPreview(v.data.uuid)
  }else if(v.key===Utils.ActionTypes.timesheet){
    timesheetDepartmentStore.payload.worker_position_id = v.data.id
    timesheetDepartmentStore.visible = true
  }else if(v.key === Utils.ActionTypes.edit){
    goPush(v.data)
  }
}

const onPreview =(uuid)=>{
  if(!accStore.checkAction(accStore.pn.hrWorkersWrite)) return

  previewRef?.value.openPreview(uuid)
}

const options = [
  {
    label: t('content.view'),
    key: Utils.ActionTypes.view,
    icon: UIHelper.renderIcon(Eye16Regular),
  },
  {
    label: t('content.edit'),
    key: Utils.ActionTypes.edit,
    icon: UIHelper.renderIcon(Edit32Regular),
  },
  {
    label: t('timesheet.assignUser'),
    key: Utils.ActionTypes.timesheet,
    icon: UIHelper.renderIcon(Table24Regular),
  }
]

const showDropdownRef = ref(false)
const x = ref(0);
const y = ref(0);

const handleSelect =(key)=> {
  showDropdownRef.value = false;
  onSelectEv({key, data:selectedItem.value})
}
const handleContextMenu =(e,v) =>{
  e.preventDefault();
  selectedItem.value = v
  showDropdownRef.value = false;
  nextTick().then(() => {
    showDropdownRef.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  });
}

const onClickoutside=()=> {
  showDropdownRef.value = false;
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
          <th class="text-center! min-w-[40px] w-[40px]">
            <n-tooltip v-if="exportStore.isExportingResume" trigger="hover">
              {{$t('exportPage.checkAll')}}
              <template #trigger>
                <n-checkbox @click="exportStore.toggleAll" :checked="exportStore.resumePayload.all" />
              </template>
            </n-tooltip>
            <span v-else>
              {{ $t('content.number')}}
            </span>
          </th>
          <th class="min-w-[200px] w-[280px]">{{$t('content.worker')}}</th>
          <th >{{$t('workerPage.table.department')}}</th>
          <th >{{$t('workerPage.table.position')}}</th>
          <th >{{$t('workerPage.table.organization')}}</th>
          <th class="min-w-[40px] w-[40px]">{{$t('workerPage.table.group')}}</th>
          <th class="min-w-[40px] w-[40px]">{{$t('workerPage.table.rank')}}</th>
          <th class="min-w-[40px] w-[40px]">{{$t('workerPage.table.rate')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(item, idx) in store.list"
            :key="idx"
            @contextmenu="handleContextMenu($event, item)"
        >
          <td class="text-center">
            <n-checkbox @click="exportStore.toggleResumeWorker(item)" :checked="exportStore.resumePayload.worker_ids.includes(item.id) || exportStore.resumePayload.all" :disabled="exportStore.resumePayload.all" v-if="exportStore.isExportingResume" />
            <span v-else class="text-[12px] text-gray-600">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span>
          </td>
          <td>
            <UIUser
                :short="false"
                @onClickFullName="onPreview(item.uuid)"
                :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.type?.name,
                  }"
            >
            </UIUser>
          </td>
          <td>{{item?.department?.name}}</td>
          <td>{{item?.position?.name}}</td>
          <td>{{item?.organization?.name}}</td>
          <td><div class="flex justify-center "><n-button size="small" circle>{{item?.group}}</n-button></div></td>
          <td><div class="flex justify-center "><n-button size="small" circle >{{item?.rank}}</n-button></div></td>
          <td><div class="flex justify-center "><n-button size="small" circle>{{item?.rate}}</n-button></div></td>

          <td>
            <UIMenuButton
                :data="item"
                show-view
                show-edit
                :show-delete="false"
                @selectEv="onSelectEv"
                :extra-options="[{
                  label: $t('timesheet.assignUser'),
                  key: Utils.ActionTypes.timesheet,
                  icon: Table24Regular,
                  visible:true,
                }]"
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
      <n-dropdown
          size="small"
          placement="bottom-start"
          trigger="manual"
          :x="x"
          :y="y"
          :options="options"
          :show="showDropdownRef"
          :on-clickoutside="onClickoutside"
          @select="handleSelect"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
  <UIWorkerView ref="previewRef"/>
</template>

<style scoped>

</style>