<script setup>
import {NoDataPicture, UIActionButton, UIPagination} from "@/components/index.js"
import {useSpecialityStore, useComponentStore} from "@/store/modules/index.js"
const store = useSpecialityStore()
const compStore = useComponentStore()




const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.payload.name_ru = v.name_ru
  store.visible = true

  if(compStore.educationList.length ===0){
    compStore._enums()
  }

  if(compStore.regionList.length === 0){
    compStore._regions()
  }
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
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-10"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('othersPage.speciality.form.name')}}</th>
          <th class="w-[300px]">{{$t('othersPage.speciality.form.name_ru')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.name}}</td>
          <td>{{item.name_ru}}</td>
          <td>
            <UIActionButton
                :data="item"
                :loading-delete="item.id === store.elementId && store.deleteLoading"
                @on-edit="onEdit"
                @on-delete="onDelete"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-show="store.list.length>10"
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