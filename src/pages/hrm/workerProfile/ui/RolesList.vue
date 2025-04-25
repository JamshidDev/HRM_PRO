<script setup>
import {useWorkerProfileStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {UIBadge, UIMenuButton, UIModal} from "@/components/index.js"
import {RibbonStar24Filled, Attach12Regular} from "@vicons/fluent"
import {useRoute} from "vue-router"
import RoleForm from "./RoleForm.vue"
const route = useRoute()

const store = useWorkerProfileStore()

const onSelectEv = (v)=>{
  if(v.key === Utils.ActionTypes.delete){
    onDelete(v.data)
  }
}

const onDelete = (v)=>{
  const id = route.query.id
  let data = {
    organization_id:v.id,
    role_id:v.roleId,
  }
  store._deleteRole(data, id)
}

const onAdd = ()=>{
  store.rolePayload.role = null
  store.rolePayload.organization_id = []
  store.roleVisible = true
}
</script>

<template>
<div class="w-full grid grid-cols-12 border border-dashed border-surface-line rounded-lg">
    <div class="col-span-12 px-2 pt-2 flex justify-between items-center mb-1">
      <span class=" font-medium">{{$t('workerProfile.roles.title')}}</span>
      <n-button @click="onAdd">{{$t('workerProfile.roles.attachRole')}}
        <template #icon>
          <Attach12Regular/>
        </template>
      </n-button>
    </div>
    <div class="col-span-12 p-2">
      <n-table
          v-if="store.rolesList.length>0"

          class="border-dashed"
          size="small"
      >
        <tbody>
        <tr v-for="(item, idx) in store.rolesList" :key="idx">
          <td class="w-[40px] min-w-[40px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td
              class="w-[40px] min-w-[200px]"
          >
            <UIBadge
                :label="item?.roleName"
                :type="Utils.colorTypes.dark"
            >
              <template #icon>
                <n-icon size="20">
                  <RibbonStar24Filled/>
                </n-icon>
              </template>
            </UIBadge>
          </td>
          <td>
            <UIBadge
                :show-icon="false"
                :label="item?.name"
                :type="Utils.colorTypes.success"
            />
          </td>
          <td class="w-[40px] min-w-[40px]">
            <UIMenuButton
                :data="item"
                @selectEv="onSelectEv"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <div v-if="store.rolesList.length === 0 && !store.loading" class="text-center text-secondary">{{$t('content.no-data')}}</div>
    </div>

  <div class="col-span-12">
    <UIModal
        :width="600"
        :visible="store.roleVisible"
        @update:visible="(v)=>store.roleVisible = v"
        :title="$t('content.attachment')"
    >

    <RoleForm/>
    </UIModal>
  </div>
</div>
</template>

<style scoped>

</style>