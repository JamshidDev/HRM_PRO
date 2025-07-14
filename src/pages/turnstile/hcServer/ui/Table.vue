<script setup>
import {NoDataPicture,UIPagination, UIUser, UIBadge} from "@/components/index.js"
import {useHcServerStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useHcServerStore()
const compStore = useComponentStore()
const accStore = useAccountStore()

const onEdit = (v)=>{


}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(!accStore.checkAction(accStore.pn.hrVacationsWrite)) return
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v.data)
  }else if(Utils.ActionTypes.delete === v.key){
    onDelete(v.data)
  }
}

onMounted(()=>{
  store._index()
})

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
          <th class="min-w-[200px]">{{$t('hcServer.form.name')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('hcServer.form.workers_count')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('hcServer.form.exported_count')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('hcServer.form.status')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.date')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td><span>{{item?.name}}</span></td>
          <td>
            <div>
              <UIBadge :type="Utils.colorTypes.info" :show-icon="false" :label="item?.workers_count"></UIBadge>
            </div>
          </td>
          <td>
            <div>
              <UIBadge :type="Utils.colorTypes.success" :show-icon="false" :label="item?.exported_count"></UIBadge>
            </div>
          </td>
          <td>{{item?.status}}</td>
          <td>{{Utils.timeOnlyDate(item?.created_at)}}</td>
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