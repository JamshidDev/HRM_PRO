<script setup>
import {useAccountStore, useWorkerProfileStore} from "@/store/modules/index.js"

import Filter from "@/pages/hrm/UserRole/ui/Filter.vue"
import Utils from "@/utils/Utils.js"
import {NoDataPicture, UIBadge, UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import {RibbonStar24Filled} from "@vicons/fluent"

const store = useWorkerProfileStore()
const accStore = useAccountStore()


const onEdit = (v)=>{
  store.elementId = v.id
  store.visibleType = false
  store.visible = true
  store._show((v)=>{
    store.payload.from = Utils.datePickerFormatter(v.from)
    store.payload.to = Utils.datePickerFormatter(v.to)
    store.payload.comment = v.comment
    store.payload.status = v.status.id
    if(v?.file){
      store.payload.file = [
        {
          id:1,
          name:Utils.fileNameFromUrl(v?.file),
          file:null,

        }
      ]
    }

    if(compStore.medStatus.length === 0){
      compStore._enums()
    }

    if(v.worker_position){
      store.payload.organization_id = [v.organization]
      store.payload.worker_position_id = v.worker_position.id
      store.activeTab = 1
      store.payload.pin = null
      compStore.selectedWorker = null
      compStore.workerParams.organization_id = v.organization?.id
      compStore._workers()
    }
    else{
      compStore.selectedWorker ={
        lastName:v.worker.last_name,
        firstName:v.worker.first_name,
        middleName:v.worker.middle_name,
        position:v?.position,
        photo:v.worker.photo || Utils.noAvailableImage,
        pin:v.worker.uuid
      }
      store.payload.pin = v.worker.id.toString()
      store.activeTab = 2
      store.payload.worker_position_id = null
      store.payload.organization_id = []

    }
  })
  compStore.selectedWorker ={
    lastName:v.worker.last_name,
    firstName:v.worker.first_name,
    middleName:v.worker.middle_name,
    position:v.position,
    photo:v.worker.photo || Utils.noAvailableImage,
    pin:v.worker.uuid
  }

}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  store.userRoleParams.page = v.page
  store.userRoleParams.per_page = v.per_page
  store._userRole()
}

const onSelectEv = (v)=>{
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v.data)
  }else if(Utils.ActionTypes.delete === v.key){
    onDelete(v.data)
  }
}

onMounted(()=>{
  if(!accStore.checkAction(accStore.pn.hrUsersRead)) return
  store._userRole()
})
</script>

<template>
<div class="w-full">
  <Filter/>
  <div class="h-[calc(100vh-200px)] overflow-y-auto mt-4">
    <n-spin :show="store.userRoleLoading" style="min-height: 200px">
      <div class="w-full overflow-x-auto"  v-if="store.userRoleList.length>0">
        <n-table
            class="mt-4"
            :single-line="false"
            size="small"
        >
          <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
            <th class="min-w-[200px] w-[250px]">{{$t('confirmationPage.table.worker')}}</th>
            <th class="min-w-[100px]">{{$t('workerRole.from.role')}}</th>
            <th class="min-w-[200px] w-[300px]">{{$t('workerRole.from.activeOrganization')}}</th>

            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in store.userRoleList" :key="idx">
            <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.userRoleParams.page - 1) * store.userRoleParams.per_page + idx + 1 }}</span></td>
            <td>
              <div>
                <UIUser
                    :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.position,
                  }"
                />
              </div>
            </td>
            <td>
              <div class="flex flex-wrap gap-2">
                <template v-for="(role, idx) in item.roles" :key="idx" >
                  <div>
                    <UIBadge :label="role.name" :type="Utils.colorTypes.dark">
                      <template #icon>
                        <n-icon size="20">
                          <RibbonStar24Filled/>
                        </n-icon>
                      </template>
                    </UIBadge>
                  </div>
                </template>
              </div>
            </td>
            <td>
              <div>{{item.current_organization?.name}}</div>
            </td>

            <td>
              <UIMenuButton
                  :data="item"
                  :show-delete="false"
                  @selectEv="onSelectEv"
              />
            </td>
          </tr>
          </tbody>
        </n-table>
      </div>
      <NoDataPicture v-if="store.userRoleList.length===0 && !store.userRoleLoading" />
    </n-spin>
  </div>
  <UIPagination
      :page="store.userRoleParams.page"
      :per_page="store.userRoleParams.per_page"
      :total="store.userRoleTotal"
      @change-page="changePage"
  />
</div>
</template>

<style scoped>

</style>